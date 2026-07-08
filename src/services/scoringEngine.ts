import type {
  ClothingItem, WeatherInfo, SceneType, OutfitScore, OutfitLog, StandardStyle, SceneTag,
} from '../types'
import {
  COLOR_PAIR_TIER1, COLOR_PAIR_TIER2, COLOR_PAIR_TIER3, NEUTRAL_COLORS,
  STYLE_COMPAT_MATRIX, getRecommendedWarmRange, adjustWarmIndexForHumidity,
  getScoreGrade, LEGACY_SCENE_MAP, RECOMMEND_WEIGHTS,
} from '../standards'
import { normalizeClothingItem } from './itemStandards'

function pairKey(a: StandardStyle, b: StandardStyle): string {
  return [a, b].sort().join('+')
}

function colorPairTier(c1: string, c2: string): number {
  const match = (pairs: [string, string][]) =>
    pairs.some(([a, b]) => (a === c1 && b === c2) || (a === c2 && b === c1))
  if (match(COLOR_PAIR_TIER1)) return 100
  if (match(COLOR_PAIR_TIER2)) return 90
  if (match(COLOR_PAIR_TIER3)) return 80
  if (c1 === c2) return 85
  if (NEUTRAL_COLORS.includes(c1 as typeof NEUTRAL_COLORS[number]) ||
      NEUTRAL_COLORS.includes(c2 as typeof NEUTRAL_COLORS[number])) return 75
  return 60
}

/** 颜色协调 30分 */
function scoreColorHarmony(items: ClothingItem[]): { score: number; notes: string[] } {
  const notes: string[] = []
  const colors = items.map((i) => i.color)
  const unique = [...new Set(colors)]

  let countScore = 10
  if (unique.length > 4) { countScore = 4; notes.push('颜色超过四种，视觉较杂乱') }
  else if (unique.length === 4) { countScore = 7; notes.push('颜色偏多，建议控制在3-4种') }
  else if (unique.length <= 2) { countScore = 10; notes.push('主色调简洁') }

  let relationScore = 0
  let pairCount = 0
  for (let i = 0; i < unique.length; i++) {
    for (let j = i + 1; j < unique.length; j++) {
      relationScore += colorPairTier(unique[i], unique[j])
      pairCount++
    }
  }
  relationScore = pairCount > 0 ? (relationScore / pairCount / 100) * 10 : 8

  const heavyCount = items.filter((i) => i.colorAttrs?.visualWeight === '重').length
  const lightCount = items.filter((i) => i.colorAttrs?.visualWeight === '轻').length
  let balanceScore = 8
  if (heavyCount >= 3) { balanceScore = 4; notes.push('深色单品过多，建议加入浅色平衡') }
  else if (heavyCount >= 1 && lightCount >= 1) { balanceScore = 10; notes.push('深浅搭配平衡良好') }
  else if (lightCount >= 2) { balanceScore = 9 }

  const highSat = items.filter((i) => (i.colorAttrs?.saturation ?? 0) > 70).length
  if (highSat >= 3) { balanceScore = Math.min(balanceScore, 5); notes.push('高饱和色过多') }

  return { score: Math.round(countScore + relationScore + balanceScore), notes }
}

/** 风格统一 25分 */
function scoreStyleUnity(items: ClothingItem[]): { score: number; notes: string[] } {
  const notes: string[] = []
  const allStyles = items.flatMap((i) => (i.styleTags ?? []).map((t) => t.style))
  if (allStyles.length === 0) return { score: 15, notes: ['风格标签不完整'] }

  const primaryStyles = items.map((i) => i.styleTags?.[0]?.style).filter(Boolean) as StandardStyle[]
  const uniquePrimary = [...new Set(primaryStyles)]

  let consistencyScore = 10
  if (uniquePrimary.length === 1) { consistencyScore = 10; notes.push('主风格高度统一') }
  else if (uniquePrimary.length === 2) {
    const compat = STYLE_COMPAT_MATRIX[pairKey(uniquePrimary[0], uniquePrimary[1])] ?? 70
    consistencyScore = Math.round(compat / 10)
    notes.push(`风格组合 ${uniquePrimary.join('+')} 兼容度 ${compat}%`)
  } else {
    consistencyScore = 4
    notes.push('风格过多，建议统一1-2种主风格')
  }

  const fabrics = [...new Set(items.map((i) => i.fabric))]
  let materialScore = 5
  if (fabrics.length > 3) { materialScore = 2; notes.push('材质种类偏多') }
  else if (fabrics.length <= 2) materialScore = 5

  const fits = items.filter((i) => ['上衣', '下装', '外套'].includes(i.category)).map((i) => i.fit)
  let fitScore = 8
  const hasOversize = fits.includes('oversize')
  const hasSlim = fits.includes('修身')
  if (hasOversize && hasSlim) { fitScore = 5; notes.push('版型对比强烈，需注意比例') }
  else if (fits.every((f) => f === fits[0])) { fitScore = 10; notes.push('版型协调') }

  return { score: Math.min(25, consistencyScore + materialScore + fitScore), notes }
}

/** 天气适配 20分 */
function scoreWeatherFit(items: ClothingItem[], weather?: WeatherInfo): { score: number; notes: string[] } {
  if (!weather) return { score: 15, notes: ['未提供天气数据，给予默认分'] }
  const notes: string[] = []
  const t = weather.temperature
  let range = getRecommendedWarmRange(t)
  range = adjustWarmIndexForHumidity(range, weather.humidity)

  const warmIndices = items
    .filter((i) => ['上衣', '下装', '外套', '连衣裙'].includes(i.category))
    .map((i) => i.warmIndex ?? 3)

  const avgWarm = warmIndices.length > 0
    ? warmIndices.reduce((a, b) => a + b, 0) / warmIndices.length
    : 3

  let tempScore = 10
  if (avgWarm >= range[0] && avgWarm <= range[1]) {
    tempScore = 10
    notes.push(`保暖指数 ${avgWarm.toFixed(1)} 符合 ${t}°C 推荐区间 ${range[0]}-${range[1]}`)
  } else if (avgWarm < range[0]) {
    tempScore = Math.max(3, 10 - (range[0] - avgWarm) * 2)
    notes.push('穿着偏薄，可能不够保暖')
  } else {
    tempScore = Math.max(3, 10 - (avgWarm - range[1]) * 2)
    notes.push('穿着偏厚，可能过热')
  }

  let humidityScore = 5
  if (weather.humidity >= 80) {
    const breathable = items.filter((i) => ['棉', '麻', '涤纶'].includes(i.fabric)).length
    humidityScore = breathable >= 2 ? 5 : 2
    if (humidityScore < 5) notes.push('高湿度天气建议透气面料')
  }

  let rainScore = 5
  const rainy = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(weather.weatherCode)
  if (rainy) {
    const hasOuter = items.some((i) => i.category === '外套')
    const hasLeather = items.some((i) => i.fabric === '皮革')
    rainScore = hasOuter || hasLeather ? 5 : 2
    if (rainScore < 5) notes.push('雨天建议防水外套或皮革鞋履')
  }

  return { score: Math.round(tempScore + humidityScore + rainScore), notes }
}

/** 场景适配 15分 */
function scoreSceneFit(
  items: ClothingItem[],
  scene?: SceneType,
  sceneTag?: SceneTag,
): { score: number; notes: string[] } {
  const notes: string[] = []
  const targetTags: SceneTag[] = sceneTag
    ? [sceneTag]
    : scene
      ? LEGACY_SCENE_MAP[scene]
      : []

  if (targetTags.length === 0) return { score: 12, notes: ['未指定场景，给予默认分'] }

  let matchCount = 0
  for (const item of items) {
    const itemTags = item.sceneTags ?? []
    if (targetTags.some((t) => itemTags.includes(t))) matchCount++
  }
  const sceneScore = Math.round((matchCount / items.length) * 10)

  const avgFormality = items.reduce((s, i) => s + (i.formalityLevel ?? 4), 0) / items.length
  const sceneFormality: Record<SceneTag, number> = {
    '通勤': 6, '校园': 4, '约会': 5, '聚会': 5, '旅行': 3,
    '运动': 3, '商务': 7, '居家': 2, '正式活动': 8, '户外': 3,
  }
  const targetFormality = sceneFormality[targetTags[0]] ?? 5
  const formalityDiff = Math.abs(avgFormality - targetFormality)
  const formalityScore = formalityDiff <= 1 ? 5 : formalityDiff <= 2 ? 3 : 1

  if (sceneScore >= 8) notes.push('场景标签匹配良好')
  else notes.push('部分单品不太适合该场景')

  return { score: Math.min(15, sceneScore + formalityScore), notes }
}

/** 层次感 10分 */
function scoreLayering(items: ClothingItem[]): { score: number; notes: string[] } {
  const notes: string[] = []
  const hasTop = items.some((i) => i.category === '上衣' || i.category === '连衣裙')
  const hasBottom = items.some((i) => i.category === '下装')
  const hasOuter = items.some((i) => i.category === '外套')
  const hasShoes = items.some((i) => i.category === '鞋履')
  const hasAccessory = items.some((i) => ['包包', '配饰'].includes(i.category))

  let proportionScore = 3
  if (hasTop && (hasBottom || items.some((i) => i.category === '连衣裙'))) {
    proportionScore = 3
    notes.push('上下装比例完整')
  } else if (items.some((i) => i.category === '连衣裙')) {
    proportionScore = 3
  } else {
    proportionScore = 1
    notes.push('缺少完整上下装组合')
  }

  let layerScore = 4
  if (hasOuter && hasTop) { layerScore = 4; notes.push('内外叠穿层次清晰') }
  else if (hasTop) layerScore = 3

  let accessoryScore = 0
  if (hasShoes) accessoryScore += 2
  if (hasAccessory) accessoryScore += 1
  if (hasShoes && hasAccessory) notes.push('鞋包配饰完整')

  return { score: Math.min(10, proportionScore + layerScore + accessoryScore), notes }
}

/** 完整100分评分 */
export function scoreOutfit(
  rawItems: ClothingItem[],
  options?: { weather?: WeatherInfo; scene?: SceneType; sceneTag?: SceneTag },
): OutfitScore {
  const items = rawItems.map(normalizeClothingItem)
  if (items.length === 0) {
    return { total: 0, colorHarmony: 0, styleUnity: 0, weatherFit: 0, sceneFit: 0, layering: 0, grade: '待改进', stars: 1, explanation: ['无单品'] }
  }

  const color = scoreColorHarmony(items)
  const style = scoreStyleUnity(items)
  const weather = scoreWeatherFit(items, options?.weather)
  const scene = scoreSceneFit(items, options?.scene, options?.sceneTag)
  const layer = scoreLayering(items)

  const total = Math.min(100, color.score + style.score + weather.score + scene.score + layer.score)
  const grade = getScoreGrade(total)

  return {
    total,
    colorHarmony: color.score,
    styleUnity: style.score,
    weatherFit: weather.score,
    sceneFit: scene.score,
    layering: layer.score,
    grade: grade.label,
    stars: grade.stars,
    explanation: [...color.notes, ...style.notes, ...weather.notes, ...scene.notes, ...layer.notes],
  }
}

/** 综合推荐得分 */
export function computeRecommendScore(
  items: ClothingItem[],
  options: {
    weather?: WeatherInfo
    scene?: SceneType
    logs?: OutfitLog[]
  },
): number {
  const outfitScore = scoreOutfit(items, options)
  const outfitMatch = outfitScore.total

  let weatherFit = outfitScore.weatherFit * 5
  let sceneFit = outfitScore.sceneFit * (20 / 3)

  let userPref = 50
  if (options.logs && options.logs.length > 0) {
    const recentLogs = options.logs.slice(-30)
    const colorFreq: Record<string, number> = {}
    const styleFreq: Record<string, number> = {}
    for (const log of recentLogs) {
      for (const id of log.itemIds) {
        const item = items.find((i) => i.id === id)
        if (!item) continue
        colorFreq[item.color] = (colorFreq[item.color] ?? 0) + 1
        const st = item.styleTags?.[0]?.style
        if (st) styleFreq[st] = (styleFreq[st] ?? 0) + 1
      }
    }
    let prefScore = 0
    for (const item of items) {
      if (colorFreq[item.color]) prefScore += 20
      const st = item.styleTags?.[0]?.style
      if (st && styleFreq[st]) prefScore += 15
    }
    userPref = Math.min(100, 40 + prefScore / items.length)
  }

  let wearBalance = 50
  const avgWear = items.reduce((s, i) => s + (i.wearCount ?? 0), 0) / items.length
  const maxWear = Math.max(...items.map((i) => i.wearCount ?? 0), 1)
  wearBalance = Math.round(50 + (1 - avgWear / maxWear) * 50)

  return Math.round(
    outfitMatch * RECOMMEND_WEIGHTS.outfitMatch +
    weatherFit * RECOMMEND_WEIGHTS.weatherFit +
    sceneFit * RECOMMEND_WEIGHTS.sceneFit +
    userPref * RECOMMEND_WEIGHTS.userPreference +
    wearBalance * RECOMMEND_WEIGHTS.wearBalance,
  )
}

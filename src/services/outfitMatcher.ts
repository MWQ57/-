import type { ClothingItem, ClothingStyle, SceneType, ClothingColor } from '../types'
import { SCENE_STYLE_MAP } from '../types'

const NEUTRAL_COLORS: ClothingColor[] = ['黑色', '白色', '灰色', '米色', '棕色']

const COLOR_HARMONY: Record<ClothingColor, ClothingColor[]> = {
  '黑色': ['白色', '灰色', '米色', '红色', '粉色', '蓝色'],
  '白色': ['黑色', '蓝色', '米色', '棕色', '灰色', '红色'],
  '灰色': ['黑色', '白色', '粉色', '蓝色', '紫色'],
  '米色': ['棕色', '白色', '蓝色', '绿色', '黑色'],
  '棕色': ['米色', '白色', '绿色', '橙色', '蓝色'],
  '红色': ['黑色', '白色', '米色', '蓝色', '灰色'],
  '粉色': ['白色', '灰色', '蓝色', '黑色', '米色'],
  '橙色': ['蓝色', '白色', '棕色', '米色'],
  '黄色': ['蓝色', '灰色', '白色', '棕色'],
  '绿色': ['米色', '棕色', '白色', '黑色'],
  '蓝色': ['白色', '米色', '灰色', '棕色', '橙色'],
  '紫色': ['白色', '灰色', '米色', '黑色'],
  '多色': ['黑色', '白色', '灰色', '米色'],
  '其他': ['黑色', '白色', '灰色', '米色'],
}

function colorScore(a: ClothingColor, b: ClothingColor): number {
  if (a === b) return 15
  if (NEUTRAL_COLORS.includes(a) || NEUTRAL_COLORS.includes(b)) return 20
  const harmony = COLOR_HARMONY[a] ?? []
  return harmony.includes(b) ? 25 : -5
}

function styleScore(a: ClothingStyle, b: ClothingStyle): number {
  if (a === b) return 30
  const pairs: [ClothingStyle, ClothingStyle][] = [
    ['休闲', '简约'], ['通勤', '简约'], ['通勤', '优雅'],
    ['运动', '休闲'], ['街头', '休闲'], ['甜美', '优雅'],
    ['复古', '优雅'], ['户外', '运动'],
  ]
  return pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a)) ? 15 : -10
}

function seasonScore(a: string, b: string): number {
  if (a === b || a === '四季' || b === '四季') return 15
  const adjacent: Record<string, string[]> = { '春': ['秋', '夏'], '夏': ['春', '秋'], '秋': ['春', '冬'], '冬': ['秋', '春'] }
  return adjacent[a]?.includes(b) ? 5 : -15
}

export function scorePair(base: ClothingItem, candidate: ClothingItem): number {
  let score = 40
  score += colorScore(base.color, candidate.color)
  score += styleScore(base.style, candidate.style)
  score += seasonScore(base.season, candidate.season)
  if (candidate.status === '常穿') score += 8
  if (candidate.status === '待清洗') score -= 40
  if (candidate.status === '闲置') score -= 5
  return score
}

export function generateOutfits(
  items: ClothingItem[],
  baseItem: ClothingItem,
  count = 4
): ClothingItem[][] {
  const available = items.filter((i) => i.id !== baseItem.id && i.status !== '待清洗')
  const outfits: ClothingItem[][] = []

  const bottoms = available.filter((i) => i.category === '下装')
  const outers = available.filter((i) => i.category === '外套')
  const shoes = available.filter((i) => i.category === '鞋履')
  const bags = available.filter((i) => i.category === '包包')
  const tops = available.filter((i) => ['上衣', '连衣裙'].includes(i.category))

  for (let n = 0; n < count; n++) {
    const outfit: ClothingItem[] = [baseItem]

    if (baseItem.category === '上衣' || baseItem.category === '连衣裙') {
      if (baseItem.category === '上衣') {
        const sorted = [...bottoms].sort((a, b) => scorePair(baseItem, b) - scorePair(baseItem, a))
        if (sorted[n % sorted.length]) outfit.push(sorted[n % sorted.length])
      }
    } else if (baseItem.category === '下装') {
      const sorted = [...tops].sort((a, b) => scorePair(baseItem, b) - scorePair(baseItem, a))
      if (sorted[n % sorted.length]) outfit.push(sorted[n % sorted.length])
    } else if (baseItem.category === '外套') {
      const sortedTops = [...tops].sort((a, b) => scorePair(baseItem, b) - scorePair(baseItem, a))
      const sortedBottoms = [...bottoms].sort((a, b) => scorePair(baseItem, b) - scorePair(baseItem, a))
      if (sortedTops[n % sortedTops.length]) outfit.push(sortedTops[n % sortedTops.length])
      if (sortedBottoms[n % sortedBottoms.length]) outfit.push(sortedBottoms[n % sortedBottoms.length])
    } else {
      const sortedTops = [...tops].sort((a, b) => scorePair(baseItem, b) - scorePair(baseItem, a))
      if (sortedTops[n % sortedTops.length]) outfit.push(sortedTops[n % sortedTops.length])
      const sortedBottoms = [...bottoms].sort((a, b) => scorePair(baseItem, b) - scorePair(baseItem, a))
      if (sortedBottoms[n % sortedBottoms.length]) outfit.push(sortedBottoms[n % sortedBottoms.length])
    }

    if (baseItem.category !== '外套' && outers.length > 0 && n % 2 === 0) {
      const sorted = [...outers].sort((a, b) => scorePair(baseItem, b) - scorePair(baseItem, a))
      if (sorted[n % sorted.length]) outfit.push(sorted[n % sorted.length])
    }

    if (shoes.length > 0) {
      const sorted = [...shoes].sort((a, b) => scorePair(baseItem, b) - scorePair(baseItem, a))
      outfit.push(sorted[n % sorted.length])
    }

    if (bags.length > 0 && n < 3) {
      const sorted = [...bags].sort((a, b) => scorePair(baseItem, b) - scorePair(baseItem, a))
      outfit.push(sorted[n % sorted.length])
    }

    if (outfit.length >= 2) outfits.push(outfit)
  }

  return outfits
}

export function recommendForScene(
  items: ClothingItem[],
  scene: SceneType,
  count = 3
): ClothingItem[][] {
  const styles = SCENE_STYLE_MAP[scene]
  const available = items.filter(
    (i) => i.status !== '待清洗' && (styles.includes(i.style) || i.style === '简约')
  )
  const pool = available.length >= 3 ? available : items.filter((i) => i.status !== '待清洗')

  const tops = pool.filter((i) => ['上衣', '连衣裙'].includes(i.category))
  const bottoms = pool.filter((i) => i.category === '下装')
  const outers = pool.filter((i) => i.category === '外套')
  const shoes = pool.filter((i) => i.category === '鞋履')
  const bags = pool.filter((i) => i.category === '包包')

  const outfits: ClothingItem[][] = []

  for (let n = 0; n < count; n++) {
    const outfit: ClothingItem[] = []
    const top = tops[n % tops.length]
    if (top) outfit.push(top)

    if (top?.category !== '连衣裙') {
      const bottom = bottoms[n % bottoms.length]
      if (bottom) outfit.push(bottom)
    }

    if (scene === '通勤办公' || scene === '正式场合') {
      const outer = outers.find((o) => ['通勤', '正式', '优雅'].includes(o.style)) ?? outers[n % outers.length]
      if (outer) outfit.push(outer)
    } else if (scene === '运动户外') {
      /* skip outer */
    } else if (outers.length > 0 && n % 2 === 1) {
      outfit.push(outers[n % outers.length])
    }

    if (shoes.length > 0) outfit.push(shoes[n % shoes.length])
    if (bags.length > 0 && scene !== '运动户外') outfit.push(bags[n % bags.length])

    if (outfit.length >= 2) outfits.push(outfit)
  }

  return outfits
}

export function getOutfitTip(items: ClothingItem[]): string {
  if (items.length === 0) return '从衣橱拖拽单品开始搭配吧'
  const colors = items.map((i) => i.color)
  const styles = items.map((i) => i.style)
  const uniqueColors = new Set(colors)

  if (uniqueColors.size > 4) return '颜色偏多，建议保留 3-4 种主色调更协调'
  if (colors.every((c) => NEUTRAL_COLORS.includes(c))) return '经典中性色搭配，简约大方'
  if (items.some((i) => i.category === '外套') && items.some((i) => i.category === '上衣')) {
    return '叠穿层次感不错，注意内外搭颜色呼应'
  }
  const uniqueStyles = new Set(styles)
  if (uniqueStyles.size > 2) return '风格混搭有风险，建议统一 1-2 种主风格'
  if (items.some((i) => i.style === '运动') && items.some((i) => i.style === '正式')) {
    return '运动与正式风格冲突，建议调整'
  }
  return '搭配协调度良好，可以保存这套方案'
}

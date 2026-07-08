import type {
  AIRecognitionResult,
  ClothingCategory,
  ClothingColor,
  ClothingFabric,
  ClothingStyle,
  FitType,
  Season,
} from '../types'

const COLOR_MAP: [number, number, number, ClothingColor][] = [
  [30, 30, 30, '黑色'],
  [220, 220, 220, '白色'],
  [120, 120, 120, '灰色'],
  [210, 195, 175, '米色'],
  [120, 80, 50, '棕色'],
  [200, 50, 50, '红色'],
  [230, 150, 160, '粉色'],
  [230, 140, 60, '橙色'],
  [230, 200, 60, '黄色'],
  [60, 150, 80, '绿色'],
  [60, 100, 200, '蓝色'],
  [130, 70, 180, '紫色'],
]

const CATEGORY_HINTS: [string, ClothingCategory][] = [
  ['连衣裙', '连衣裙'], ['吊带裙', '连衣裙'], ['衬衫裙', '连衣裙'], ['针织裙', '连衣裙'], ['dress', '连衣裙'], ['gown', '连衣裙'],
  ['半身裙', '下装'], ['短裙', '下装'], ['长裙', '下装'], ['裤', '下装'], ['牛仔裤', '下装'], ['西裤', '下装'],
  ['阔腿裤', '下装'], ['短裤', '下装'], ['pants', '下装'], ['jeans', '下装'], ['skirt', '下装'], ['shorts', '下装'], ['trouser', '下装'],
  ['西装外套', '外套'], ['棒球服', '外套'], ['防晒衣', '外套'], ['外套', '外套'], ['夹克', '外套'], ['大衣', '外套'],
  ['风衣', '外套'], ['羽绒服', '外套'], ['开衫', '外套'], ['coat', '外套'], ['jacket', '外套'], ['blazer', '外套'], ['cardigan', '外套'],
  ['鞋', '鞋履'], ['靴', '鞋履'], ['乐福', '鞋履'], ['高跟', '鞋履'], ['帆布鞋', '鞋履'], ['运动鞋', '鞋履'],
  ['shoe', '鞋履'], ['sneaker', '鞋履'], ['boot', '鞋履'], ['loafer', '鞋履'],
  ['包', '包包'], ['托特', '包包'], ['斜挎', '包包'], ['双肩包', '包包'], ['bag', '包包'], ['purse', '包包'], ['handbag', '包包'],
  ['帽', '配饰'], ['围巾', '配饰'], ['丝巾', '配饰'], ['腰带', '配饰'],
  ['hat', '配饰'], ['scarf', '配饰'], ['belt', '配饰'],
  ['衬衫', '上衣'], ['t恤', '上衣'], ['T恤', '上衣'], ['卫衣', '上衣'], ['毛衣', '上衣'], ['针织衫', '上衣'],
  ['shirt', '上衣'], ['top', '上衣'], ['tee', '上衣'], ['blouse', '上衣'], ['sweater', '上衣'],
  ['polo', '上衣'], ['背心', '上衣'],
]

const COLOR_HINTS: [string, ClothingColor][] = [
  ['黑', '黑色'], ['白', '白色'], ['灰', '灰色'], ['米', '米色'], ['杏', '米色'], ['咖', '棕色'], ['棕', '棕色'],
  ['红', '红色'], ['粉', '粉色'], ['橙', '橙色'], ['黄', '黄色'], ['绿', '绿色'], ['蓝', '蓝色'], ['紫', '紫色'],
  ['black', '黑色'], ['white', '白色'], ['gray', '灰色'], ['grey', '灰色'], ['beige', '米色'], ['brown', '棕色'],
  ['red', '红色'], ['pink', '粉色'], ['orange', '橙色'], ['yellow', '黄色'], ['green', '绿色'], ['blue', '蓝色'], ['purple', '紫色'],
]

const FABRIC_HINTS: [string, ClothingFabric][] = [
  ['棉', '棉'], ['纯棉', '棉'], ['麻', '麻'], ['亚麻', '麻'], ['真丝', '丝'], ['丝', '丝'], ['羊毛', '羊毛'],
  ['羊绒', '羊毛'], ['毛呢', '羊毛'], ['涤纶', '涤纶'], ['聚酯', '涤纶'], ['牛仔', '牛仔'], ['丹宁', '牛仔'],
  ['针织', '针织'], ['毛衣', '针织'], ['皮革', '皮革'], ['皮衣', '皮革'], ['皮鞋', '皮革'], ['混纺', '混纺'],
  ['cotton', '棉'], ['linen', '麻'], ['silk', '丝'], ['wool', '羊毛'], ['polyester', '涤纶'], ['denim', '牛仔'],
  ['knit', '针织'], ['leather', '皮革'],
]

const STYLE_HINTS: [string, ClothingStyle][] = [
  ['通勤', '通勤'], ['商务', '通勤'], ['西装', '正式'], ['正装', '正式'], ['礼服', '正式'],
  ['运动', '运动'], ['瑜伽', '运动'], ['跑步', '运动'], ['户外', '户外'], ['冲锋', '户外'], ['登山', '户外'],
  ['甜美', '甜美'], ['少女', '甜美'], ['蝴蝶结', '甜美'], ['复古', '复古'], ['法式', '优雅'], ['优雅', '优雅'],
  ['简约', '简约'], ['基础', '简约'], ['街头', '街头'], ['工装', '街头'], ['休闲', '休闲'],
  ['business', '通勤'], ['formal', '正式'], ['sport', '运动'], ['outdoor', '户外'], ['vintage', '复古'],
  ['street', '街头'], ['casual', '休闲'], ['minimal', '简约'],
]

const SEASON_HINTS: [string, Season][] = [
  ['春', '春'], ['夏', '夏'], ['秋', '秋'], ['冬', '冬'], ['四季', '四季'], ['春秋', '四季'],
  ['防晒', '夏'], ['短袖', '夏'], ['吊带', '夏'], ['羽绒', '冬'], ['毛呢', '冬'], ['羊毛', '冬'], ['保暖', '冬'],
  ['spring', '春'], ['summer', '夏'], ['autumn', '秋'], ['fall', '秋'], ['winter', '冬'],
]

const CATEGORY_NAMES: Record<ClothingCategory, string[]> = {
  '上衣': ['简约T恤', '条纹衬衫', '针织毛衣', '雪纺上衣', 'polo衫', '休闲卫衣'],
  '下装': ['直筒牛仔裤', '休闲西裤', 'A字半身裙', '运动短裤', '阔腿裤', '九分裤'],
  '外套': ['风衣外套', '牛仔夹克', '羽绒服', '西装外套', '针织开衫', '休闲夹克'],
  '连衣裙': ['碎花连衣裙', '针织连衣裙', '衬衫裙', '吊带裙', 'A字连衣裙'],
  '鞋履': ['小白鞋', '乐福鞋', '运动鞋', '短靴', '高跟鞋', '帆布鞋'],
  '包包': ['托特包', '斜挎包', '双肩包', '手拿包', '单肩包'],
  '配饰': ['丝巾', '腰带', '棒球帽', '围巾', '发饰'],
  '内衣': ['打底背心', '保暖内衣'],
  '其他': ['单品'],
}

interface SubjectAnalysis {
  aspectRatio: number
  subjectRatio: number
  topRatio: number
  midRatio: number
  botRatio: number
  centerX: number
  centerY: number
  dominantColor: ClothingColor
  colorVariance: number
}

function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
  }

  return { h, s, l }
}

function matchColor(r: number, g: number, b: number): ClothingColor {
  const { h, s, l } = rgbToHsl(r, g, b)

  if (l < 0.16) return '黑色'
  if (l > 0.9 && s < 0.2) return '白色'
  if (s < 0.13) return l > 0.82 ? '白色' : '灰色'
  if (h >= 25 && h <= 58 && l > 0.62 && s < 0.42) return '米色'
  if (h >= 18 && h <= 45 && l < 0.48) return '棕色'
  if (h < 12 || h >= 345) return l > 0.62 ? '粉色' : '红色'
  if (h < 24) return '橙色'
  if (h < 65) return '黄色'
  if (h < 170) return '绿色'
  if (h < 255) return '蓝色'
  if (h < 315) return '紫色'
  if (h < 345) return '粉色'

  let best: ClothingColor = '其他'
  let minDist = Infinity
  for (const [cr, cg, cb, name] of COLOR_MAP) {
    const dist = colorDistance(r, g, b, cr, cg, cb)
    if (dist < minDist) { minDist = dist; best = name }
  }
  return best
}

function hintFromList<T>(filename: string, hints: [string, T][]): T | null {
  const lower = filename.toLowerCase()
  for (const [hint, value] of hints) {
    if (lower.includes(hint.toLowerCase())) return value
  }
  return null
}

function analyzeImage(imageUrl: string): Promise<SubjectAnalysis> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const maxSize = 200
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(defaultAnalysis())
        return
      }

      ctx.drawImage(img, 0, 0, w, h)
      const data = ctx.getImageData(0, 0, w, h).data

      let minX = w, minY = h, maxX = 0, maxY = 0
      let subjectCount = 0
      const colorBuckets = new Map<string, { r: number; g: number; b: number; count: number }>()
      const thirdH = h / 3
      let topCount = 0, midCount = 0, botCount = 0
      let sumR = 0, sumG = 0, sumB = 0

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4
          const alpha = data[i + 3]
          const r = data[i], g = data[i + 1], b = data[i + 2]

          const isSubject = alpha > 128 && !(r > 240 && g > 240 && b > 240 && alpha === 255)
          if (!isSubject) continue

          subjectCount++
          minX = Math.min(minX, x)
          minY = Math.min(minY, y)
          maxX = Math.max(maxX, x)
          maxY = Math.max(maxY, y)

          if (y < thirdH) topCount++
          else if (y < thirdH * 2) midCount++
          else botCount++

          sumR += r; sumG += g; sumB += b

          const key = `${Math.round(r / 24)}-${Math.round(g / 24)}-${Math.round(b / 24)}`
          const bucket = colorBuckets.get(key) ?? { r: 0, g: 0, b: 0, count: 0 }
          bucket.r += r; bucket.g += g; bucket.b += b; bucket.count++
          colorBuckets.set(key, bucket)
        }
      }

      if (subjectCount === 0) {
        resolve(defaultAnalysis())
        return
      }

      const bboxW = maxX - minX + 1
      const bboxH = maxY - minY + 1
      const totalPixels = w * h

      let bestBucket = { r: 0, g: 0, b: 0, count: 0 }
      for (const bucket of colorBuckets.values()) {
        if (bucket.count > bestBucket.count) bestBucket = bucket
      }

      const avgR = bestBucket.count > 0 ? bestBucket.r / bestBucket.count : sumR / subjectCount
      const avgG = bestBucket.count > 0 ? bestBucket.g / bestBucket.count : sumG / subjectCount
      const avgB = bestBucket.count > 0 ? bestBucket.b / bestBucket.count : sumB / subjectCount

      let variance = 0
      for (const bucket of colorBuckets.values()) {
        const br = bucket.r / bucket.count, bg = bucket.g / bucket.count, bb = bucket.b / bucket.count
        variance += bucket.count * colorDistance(br, bg, bb, avgR, avgG, avgB)
      }
      variance /= subjectCount

      resolve({
        aspectRatio: bboxW / bboxH,
        subjectRatio: subjectCount / totalPixels,
        topRatio: topCount / subjectCount,
        midRatio: midCount / subjectCount,
        botRatio: botCount / subjectCount,
        centerX: (minX + maxX) / 2 / w,
        centerY: (minY + maxY) / 2 / h,
        dominantColor: matchColor(avgR, avgG, avgB),
        colorVariance: variance,
      })
    }
    img.onerror = () => resolve(defaultAnalysis())
    img.src = imageUrl
  })
}

function defaultAnalysis(): SubjectAnalysis {
  return {
    aspectRatio: 0.75, subjectRatio: 0.4,
    topRatio: 0.33, midRatio: 0.34, botRatio: 0.33,
    centerX: 0.5, centerY: 0.5,
    dominantColor: '其他', colorVariance: 0,
  }
}

function hintFromFilename(filename: string): ClothingCategory | null {
  return hintFromList(filename, CATEGORY_HINTS)
}

function scoreCategory(cat: ClothingCategory, a: SubjectAnalysis): number {
  const ar = a.aspectRatio
  const sr = a.subjectRatio
  const { topRatio: top, midRatio: mid, botRatio: bot } = a

  switch (cat) {
    case '鞋履':
      return (ar > 1.0 ? 35 : 0) + (ar > 1.3 ? 25 : 0) + (sr < 0.35 ? 20 : 0)
        + (bot > 0.4 ? 15 : 0) + (a.centerY > 0.55 ? 10 : 0)
    case '包包':
      return (ar > 0.75 && ar < 1.5 ? 30 : 0) + (sr > 0.15 && sr < 0.55 ? 25 : 0)
        + (mid > 0.3 ? 15 : 0) + (a.colorVariance > 20 ? 10 : 0)
    case '配饰':
      return (sr < 0.3 ? 35 : 0) + (sr < 0.2 ? 20 : 0) + (ar > 0.6 && ar < 1.8 ? 15 : 0)
    case '连衣裙':
      return (ar < 0.6 ? 30 : 0) + (ar < 0.45 ? 25 : 0) + (top > 0.2 && bot > 0.2 ? 25 : 0)
        + (mid > 0.25 ? 15 : 0) + (sr > 0.35 ? 10 : 0)
    case '下装':
      return (ar < 0.7 ? 25 : 0) + (ar < 0.5 ? 20 : 0) + (bot > top * 1.3 ? 35 : 0)
        + (bot > 0.38 ? 20 : 0) + (top < 0.3 ? 15 : 0)
    case '外套':
      return (ar < 0.85 ? 20 : 0) + (ar > 0.55 && ar < 0.9 ? 25 : 0) + (sr > 0.4 ? 30 : 0)
        + (top > 0.25 && mid > 0.25 ? 20 : 0) + (sr > 0.5 ? 15 : 0)
    case '上衣':
      return (ar > 0.55 && ar < 1.1 ? 25 : 0) + (top > bot * 1.1 ? 30 : 0)
        + (top > 0.35 ? 25 : 0) + (sr > 0.2 && sr < 0.6 ? 15 : 0)
    case '内衣':
      return (sr < 0.35 ? 10 : 0) + (ar > 0.5 && ar < 1.0 ? 10 : 0)
    default:
      return 5
  }
}

function detectCategory(a: SubjectAnalysis, filename: string): { category: ClothingCategory; confidence: number } {
  const hint = hintFromFilename(filename)
  const categories: ClothingCategory[] = ['上衣', '下装', '外套', '连衣裙', '鞋履', '包包', '配饰']

  const scores = categories.map((cat) => {
    let score = scoreCategory(cat, a)
    if (hint === cat) score += 50
    return { cat, score }
  })

  scores.sort((x, y) => y.score - x.score)
  const best = scores[0]
  const second = scores[1]

  const margin = best.score - (second?.score ?? 0)
  const confidence = Math.min(0.95, 0.55 + margin * 0.008 + (hint ? 0.15 : 0))

  return { category: best.cat, confidence }
}

function inferColor(filename: string, a: SubjectAnalysis): ClothingColor {
  return hintFromList(filename, COLOR_HINTS) ?? a.dominantColor
}

function inferFabric(category: ClothingCategory, color: ClothingColor, a: SubjectAnalysis, filename: string): ClothingFabric {
  const hint = hintFromList(filename, FABRIC_HINTS)
  if (hint) return hint
  if (category === '下装' && color === '蓝色' && a.colorVariance > 14) return '牛仔'
  if (['外套', '上衣'].includes(category) && a.colorVariance < 18) return '棉'
  if (['外套', '上衣'].includes(category) && a.colorVariance < 30 && a.subjectRatio > 0.35) return '针织'
  if (category === '鞋履' || category === '包包') return '皮革'
  if (category === '连衣裙' && color === '白色') return '丝'
  if (a.colorVariance > 40) return '混纺'
  const map: Partial<Record<ClothingCategory, ClothingFabric>> = {
    '上衣': '棉', '下装': '棉', '外套': '涤纶', '连衣裙': '棉',
    '鞋履': '皮革', '包包': '皮革', '配饰': '混纺',
  }
  return map[category] ?? '棉'
}

function inferStyle(category: ClothingCategory, color: ClothingColor, fabric: ClothingFabric, filename: string): ClothingStyle {
  const hint = hintFromList(filename, STYLE_HINTS)
  if (hint) return hint
  if (fabric === '羊毛' && category === '外套') return '优雅'
  if (category === '鞋履' && fabric === '皮革') return '通勤'
  if (fabric === '牛仔') return '休闲'
  if (category === '外套' && ['黑色', '灰色', '米色'].includes(color)) return '通勤'
  if (category === '连衣裙') return color === '粉色' ? '甜美' : '优雅'
  if (category === '配饰') return '简约'
  if (['红色', '粉色', '橙色'].includes(color)) return '甜美'
  if (['黑色', '白色', '灰色'].includes(color)) return '简约'
  if (category === '鞋履') return '运动'
  return '休闲'
}

function inferSeason(fabric: ClothingFabric, category: ClothingCategory, color: ClothingColor, filename: string): Season {
  const hint = hintFromList(filename, SEASON_HINTS)
  if (hint) return hint
  if (fabric === '羊毛' || category === '外套') return '冬'
  if (fabric === '麻' || (fabric === '棉' && category === '上衣' && color === '白色')) return '夏'
  if (fabric === '针织') return '秋'
  if (fabric === '皮革') return '秋'
  return '四季'
}

function inferFit(a: SubjectAnalysis): FitType {
  if (a.aspectRatio > 1.1) return '标准'
  if (a.subjectRatio > 0.55 && a.aspectRatio > 0.8) return 'oversize'
  if (a.aspectRatio < 0.5) return '修身'
  if (a.subjectRatio > 0.45) return '宽松'
  return '标准'
}

function pickName(category: ClothingCategory, color: ClothingColor, fabric: ClothingFabric): string {
  const names = CATEGORY_NAMES[category]
  const colorPrefix: Partial<Record<ClothingColor, string>> = {
    '黑色': '黑色', '白色': '白色', '蓝色': '蓝色', '红色': '红色',
    '粉色': '粉色', '灰色': '灰色', '米色': '米色', '棕色': '棕色',
  }
  const prefix = colorPrefix[color] ?? ''
  const base = names[Math.floor(names.length / 2)]
  if (fabric === '牛仔') return prefix ? `${prefix}牛仔裤` : '牛仔裤'
  if (prefix && !base.includes(prefix)) return `${prefix}${base}`
  return base
}

export async function recognizeClothing(
  imageUrl: string,
  filename = ''
): Promise<AIRecognitionResult> {
  const analysis = await analyzeImage(imageUrl)
  const { category, confidence } = detectCategory(analysis, filename)
  const color = inferColor(filename, analysis)
  const fabric = inferFabric(category, color, analysis, filename)
  const style = inferStyle(category, color, fabric, filename)
  const season = inferSeason(fabric, category, color, filename)
  const fit = inferFit(analysis)
  const name = pickName(category, color, fabric)

  return { category, color, fabric, style, season, fit, name, confidence }
}

export type ClothingCategory =
  | '上衣' | '下装' | '外套' | '连衣裙' | '鞋履' | '包包' | '配饰' | '内衣' | '其他'

export type ClothingColor =
  | '黑色' | '白色' | '灰色' | '米色' | '棕色' | '红色' | '粉色' | '橙色'
  | '黄色' | '绿色' | '蓝色' | '紫色' | '多色' | '其他'

export type ClothingFabric =
  | '棉' | '麻' | '丝' | '羊毛' | '涤纶' | '牛仔' | '针织' | '皮革' | '混纺' | '其他'

export type ClothingStyle =
  | '休闲' | '通勤' | '运动' | '甜美' | '复古' | '简约' | '街头' | '优雅' | '户外' | '正式'

export type Season = '春' | '夏' | '秋' | '冬' | '四季'

export type FitType = '修身' | '宽松' | '标准' | 'oversize'

export type ClothingStatus = '常穿' | '闲置' | '待清洗'

export type SceneType =
  | '通勤办公' | '日常休闲' | '社交约会' | '正式场合' | '运动户外' | '季节节日'

export type CanvasLayer = '内搭' | '中层' | '外套'

export type Gender = '男' | '女' | '中性'

export type PatternType = '纯色' | '条纹' | '格纹' | '印花' | 'Logo' | '迷彩' | '动物纹' | '民族纹样'

export type StandardStyle =
  | '极简' | '休闲' | '商务' | '学院' | '街头' | '运动'
  | '工装' | '复古' | '甜美' | '法式' | '韩系' | '户外'

export type SceneTag =
  | '通勤' | '校园' | '约会' | '聚会' | '旅行'
  | '运动' | '商务' | '居家' | '正式活动' | '户外'

export type OutfitLogSource = 'manual' | 'match' | 'weather' | 'scene' | 'canvas'

export interface ColorAttributes {
  hue: number
  lightness: number
  saturation: number
  warmth: '冷' | '暖' | '中性'
  visualWeight: '轻' | '中' | '重'
}

export interface StyleTag {
  style: StandardStyle
  score: number
}

export interface ClothingItem {
  id: string
  name: string
  imageUrl: string
  category: ClothingCategory
  color: ClothingColor
  fabric: ClothingFabric
  style: ClothingStyle
  season: Season
  fit: FitType
  status: ClothingStatus
  tags: string[]
  createdAt: string
  updatedAt: string
  /** 扩展标准字段 */
  subCategory?: string
  brand?: string
  gender?: Gender
  secondaryColor?: ClothingColor | '无'
  colorAttrs?: ColorAttributes
  pattern?: PatternType
  thickness?: number
  warmIndex?: number
  formalityLevel?: number
  styleTags?: StyleTag[]
  sceneTags?: SceneTag[]
  wearCount?: number
  lastWornAt?: string
}

export interface OutfitScore {
  total: number
  colorHarmony: number
  styleUnity: number
  weatherFit: number
  sceneFit: number
  layering: number
  grade: string
  stars: number
  explanation: string[]
}

export interface OutfitLog {
  id: string
  itemIds: string[]
  wornAt: string
  photoUrl?: string
  scene?: SceneType
  sceneTag?: SceneTag
  weather?: WeatherInfo
  note?: string
  rating?: 1 | 2 | 3 | 4 | 5
  source: OutfitLogSource
  score?: OutfitScore
  createdAt: string
}

export interface Outfit {
  id: string
  name: string
  items: string[]
  scene?: SceneType
  note?: string
  createdAt: string
}

export interface CanvasItem {
  id: string
  clothingId: string
  x: number
  y: number
  width: number
  height: number
  layer: CanvasLayer
  zIndex: number
}

export interface SavedCanvas {
  id: string
  name: string
  items: CanvasItem[]
  createdAt: string
}

export interface WeatherInfo {
  temperature: number
  weatherCode: number
  windSpeed: number
  humidity: number
  uvIndex: number
  description: string
  city: string
}

export interface AIRecognitionResult {
  category: ClothingCategory
  color: ClothingColor
  fabric: ClothingFabric
  style: ClothingStyle
  season: Season
  fit: FitType
  name: string
  confidence: number
}

export const CATEGORIES: ClothingCategory[] = [
  '上衣', '下装', '外套', '连衣裙', '鞋履', '包包', '配饰', '内衣', '其他',
]

export const COLORS: ClothingColor[] = [
  '黑色', '白色', '灰色', '米色', '棕色', '红色', '粉色', '橙色',
  '黄色', '绿色', '蓝色', '紫色', '多色', '其他',
]

export const FABRICS: ClothingFabric[] = [
  '棉', '麻', '丝', '羊毛', '涤纶', '牛仔', '针织', '皮革', '混纺', '其他',
]

export const STYLES: ClothingStyle[] = [
  '休闲', '通勤', '运动', '甜美', '复古', '简约', '街头', '优雅', '户外', '正式',
]

export const SEASONS: Season[] = ['春', '夏', '秋', '冬', '四季']

export const FITS: FitType[] = ['修身', '宽松', '标准', 'oversize']

export const STATUSES: ClothingStatus[] = ['常穿', '闲置', '待清洗']

export const SCENES: SceneType[] = [
  '通勤办公', '日常休闲', '社交约会', '正式场合', '运动户外', '季节节日',
]

export const SCENE_STYLE_MAP: Record<SceneType, ClothingStyle[]> = {
  '通勤办公': ['通勤', '简约', '优雅'],
  '日常休闲': ['休闲', '简约', '街头'],
  '社交约会': ['优雅', '甜美', '复古'],
  '正式场合': ['正式', '优雅', '简约'],
  '运动户外': ['运动', '户外', '休闲'],
  '季节节日': ['甜美', '复古', '优雅'],
}

export const CATEGORY_SLOTS: Record<string, ClothingCategory[]> = {
  top: ['上衣', '连衣裙'],
  bottom: ['下装'],
  outer: ['外套'],
  shoes: ['鞋履'],
  bag: ['包包'],
  accessory: ['配饰'],
}

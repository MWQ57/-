/** SMART WARDROBE 服装标签体系与评分标准常量 */

import type { ClothingColor, ClothingCategory, ClothingFabric, ClothingStyle, SceneType } from '../types'

// ─── 子分类 ───
export const SUB_CATEGORIES: Record<ClothingCategory, string[]> = {
  '上衣': ['T恤', '衬衫', '卫衣', '毛衣', '针织', 'POLO', '背心', '其他'],
  '下装': ['牛仔裤', '西裤', '休闲裤', '短裤', '半身裙', 'A字裙', '其他'],
  '外套': ['风衣', '夹克', '西装', '羽绒服', '大衣', '开衫', '其他'],
  '连衣裙': ['碎花裙', '衬衫裙', '针织裙', '吊带裙', 'A字裙', '其他'],
  '鞋履': ['运动鞋', '皮鞋', '乐福鞋', '短靴', '高跟鞋', '帆布鞋', '其他'],
  '包包': ['托特包', '斜挎包', '双肩包', '手拿包', '单肩包', '其他'],
  '配饰': ['帽子', '围巾', '腰带', '首饰', '墨镜', '其他'],
  '内衣': ['打底', '保暖内衣', '其他'],
  '其他': ['其他'],
}

// ─── 图案 ───
export type PatternType = '纯色' | '条纹' | '格纹' | '印花' | 'Logo' | '迷彩' | '动物纹' | '民族纹样'
export const PATTERNS: PatternType[] = ['纯色', '条纹', '格纹', '印花', 'Logo', '迷彩', '动物纹', '民族纹样']

// ─── 标准风格（最多3个） ───
export type StandardStyle =
  | '极简' | '休闲' | '商务' | '学院' | '街头' | '运动'
  | '工装' | '复古' | '甜美' | '法式' | '韩系' | '户外'

export const STANDARD_STYLES: StandardStyle[] = [
  '极简', '休闲', '商务', '学院', '街头', '运动',
  '工装', '复古', '甜美', '法式', '韩系', '户外',
]

/** 旧风格 → 标准风格映射 */
export const LEGACY_STYLE_MAP: Record<ClothingStyle, StandardStyle> = {
  '休闲': '休闲',
  '通勤': '商务',
  '运动': '运动',
  '甜美': '甜美',
  '复古': '复古',
  '简约': '极简',
  '街头': '街头',
  '优雅': '法式',
  '户外': '户外',
  '正式': '商务',
}

// ─── 场景标签 ───
export type SceneTag =
  | '通勤' | '校园' | '约会' | '聚会' | '旅行'
  | '运动' | '商务' | '居家' | '正式活动' | '户外'

export const SCENE_TAGS: SceneTag[] = [
  '通勤', '校园', '约会', '聚会', '旅行',
  '运动', '商务', '居家', '正式活动', '户外',
]

/** 旧场景 → 场景标签 */
export const LEGACY_SCENE_MAP: Record<SceneType, SceneTag[]> = {
  '通勤办公': ['通勤', '商务'],
  '日常休闲': ['居家', '校园'],
  '社交约会': ['约会', '聚会'],
  '正式场合': ['正式活动', '商务'],
  '运动户外': ['运动', '户外'],
  '季节节日': ['聚会', '约会'],
}

// ─── 颜色属性预设 ───
export const COLOR_ATTR_PRESETS: Record<ClothingColor, {
  hue: number; lightness: number; saturation: number
  warmth: '冷' | '暖' | '中性'; visualWeight: '轻' | '中' | '重'
}> = {
  '黑色': { hue: 0, lightness: 10, saturation: 5, warmth: '中性', visualWeight: '重' },
  '白色': { hue: 0, lightness: 95, saturation: 5, warmth: '中性', visualWeight: '轻' },
  '灰色': { hue: 0, lightness: 55, saturation: 5, warmth: '冷', visualWeight: '中' },
  '米色': { hue: 40, lightness: 85, saturation: 20, warmth: '暖', visualWeight: '轻' },
  '棕色': { hue: 30, lightness: 35, saturation: 40, warmth: '暖', visualWeight: '重' },
  '红色': { hue: 0, lightness: 45, saturation: 80, warmth: '暖', visualWeight: '重' },
  '粉色': { hue: 350, lightness: 75, saturation: 50, warmth: '暖', visualWeight: '轻' },
  '橙色': { hue: 30, lightness: 55, saturation: 85, warmth: '暖', visualWeight: '中' },
  '黄色': { hue: 50, lightness: 70, saturation: 80, warmth: '暖', visualWeight: '中' },
  '绿色': { hue: 140, lightness: 40, saturation: 50, warmth: '冷', visualWeight: '中' },
  '蓝色': { hue: 220, lightness: 45, saturation: 60, warmth: '冷', visualWeight: '中' },
  '紫色': { hue: 280, lightness: 45, saturation: 55, warmth: '冷', visualWeight: '中' },
  '多色': { hue: 0, lightness: 50, saturation: 50, warmth: '中性', visualWeight: '中' },
  '其他': { hue: 0, lightness: 50, saturation: 30, warmth: '中性', visualWeight: '中' },
}

// ─── 颜色搭配规则（四色规则） ───
export const COLOR_PAIR_TIER1: [ClothingColor, ClothingColor][] = [
  ['黑色', '白色'], ['黑色', '灰色'], ['白色', '蓝色'],
  ['米色', '棕色'], ['蓝色', '白色'], ['蓝色', '灰色'],
]

export const COLOR_PAIR_TIER2: [ClothingColor, ClothingColor][] = [
  ['黑色', '棕色'], ['灰色', '绿色'], ['棕色', '米色'],
  ['红色', '黑色'], ['蓝色', '棕色'],
]

export const COLOR_PAIR_TIER3: [ClothingColor, ClothingColor][] = [
  ['蓝色', '橙色'], ['黄色', '紫色'], ['红色', '绿色'],
]

export const NEUTRAL_COLORS: ClothingColor[] = ['黑色', '白色', '灰色', '米色', '棕色']

// ─── 风格兼容矩阵 ───
export const STYLE_COMPAT_MATRIX: Record<string, number> = {
  '休闲+休闲': 100, '商务+商务': 100, '极简+商务': 95,
  '街头+运动': 90, '复古+学院': 88, '极简+休闲': 92,
  '休闲+街头': 85, '商务+极简': 90, '甜美+法式': 88,
  '韩系+极简': 90, '户外+运动': 92, '工装+街头': 85,
  '商务+街头': 60, '甜美+工装': 55, '商务+运动': 50,
  '正式活动+运动': 45,
}

// ─── 温度 → 推荐保暖指数 ───
export function getRecommendedWarmRange(temp: number): [number, number] {
  if (temp >= 35) return [1, 2]
  if (temp >= 30) return [2, 2]
  if (temp >= 25) return [2, 3]
  if (temp >= 20) return [3, 4]
  if (temp >= 15) return [4, 6]
  if (temp >= 10) return [6, 7]
  if (temp >= 5) return [7, 8]
  if (temp >= 0) return [8, 10]
  return [9, 10]
}

/** 湿度修正：高湿度时体感更冷，保暖指数 +1 */
export function adjustWarmIndexForHumidity(baseRange: [number, number], humidity: number): [number, number] {
  if (humidity >= 80) return [baseRange[0] + 1, baseRange[1] + 1]
  if (humidity >= 60) return [baseRange[0], baseRange[1] + 1]
  return baseRange
}

// ─── 正式程度参考 ───
export const FORMALITY_LABELS: Record<number, string> = {
  1: '睡衣', 2: '居家', 3: '休闲', 4: '校园', 5: '约会',
  6: '商务休闲', 7: '商务', 8: '会议', 9: '宴会', 10: '礼服',
}

// ─── 评分等级 ───
export function getScoreGrade(total: number): { stars: number; label: string; desc: string } {
  if (total >= 95) return { stars: 5, label: '优秀', desc: '可直接推荐' }
  if (total >= 90) return { stars: 4, label: '良好', desc: '整体协调，仅需细节优化' }
  if (total >= 80) return { stars: 4, label: '合理', desc: '搭配合理，适合日常' }
  if (total >= 70) return { stars: 3, label: '基本', desc: '基本合适，可优化颜色或层次' }
  if (total >= 60) return { stars: 2, label: '一般', desc: '建议重新组合' }
  return { stars: 1, label: '待改进', desc: '风格、颜色或场景匹配度较低' }
}

// ─── 材质 → 默认厚度/保暖推断 ───
export const FABRIC_WARM_MAP: Record<ClothingFabric, { thickness: number; warmIndex: number }> = {
  '棉': { thickness: 2, warmIndex: 3 },
  '麻': { thickness: 1, warmIndex: 2 },
  '丝': { thickness: 1, warmIndex: 2 },
  '羊毛': { thickness: 4, warmIndex: 7 },
  '涤纶': { thickness: 2, warmIndex: 3 },
  '牛仔': { thickness: 3, warmIndex: 4 },
  '针织': { thickness: 3, warmIndex: 6 },
  '皮革': { thickness: 4, warmIndex: 5 },
  '混纺': { thickness: 2, warmIndex: 3 },
  '其他': { thickness: 2, warmIndex: 3 },
}

// ─── 品类 → 默认正式程度 ───
export const CATEGORY_FORMALITY: Record<ClothingCategory, number> = {
  '上衣': 4, '下装': 4, '外套': 5, '连衣裙': 5,
  '鞋履': 4, '包包': 4, '配饰': 3, '内衣': 1, '其他': 3,
}

// ─── 推荐权重 ───
export const RECOMMEND_WEIGHTS = {
  outfitMatch: 0.35,
  weatherFit: 0.25,
  sceneFit: 0.20,
  userPreference: 0.15,
  wearBalance: 0.05,
} as const

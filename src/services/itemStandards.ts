import type { ClothingItem, StyleTag, SceneTag } from '../types'
import {
  COLOR_ATTR_PRESETS,
  LEGACY_STYLE_MAP,
  FABRIC_WARM_MAP,
  CATEGORY_FORMALITY,
  SUB_CATEGORIES,
} from '../standards'

/** 为旧数据或新上传的衣物补全标准字段 */
export function normalizeClothingItem(item: ClothingItem): ClothingItem {
  const fabricDefaults = FABRIC_WARM_MAP[item.fabric] ?? FABRIC_WARM_MAP['其他']
  const categoryFormality = CATEGORY_FORMALITY[item.category] ?? 4

  let formality = item.formalityLevel ?? categoryFormality
  if (item.style === '正式') formality = Math.max(formality, 7)
  if (item.style === '运动' || item.style === '户外') formality = Math.min(formality, 4)
  if (item.category === '内衣') formality = 1

  const primaryStyle = LEGACY_STYLE_MAP[item.style]
  const styleTags: StyleTag[] = item.styleTags ?? [
    { style: primaryStyle, score: 90 },
  ]
  if (item.style === '通勤' && !styleTags.some((t) => t.style === '极简')) {
    styleTags.push({ style: '极简', score: 60 })
  }

  const sceneTags: SceneTag[] = item.sceneTags ?? inferSceneTags(item)

  return {
    ...item,
    subCategory: item.subCategory ?? SUB_CATEGORIES[item.category]?.[0] ?? '其他',
    gender: item.gender ?? '中性',
    secondaryColor: item.secondaryColor ?? '无',
    colorAttrs: item.colorAttrs ?? COLOR_ATTR_PRESETS[item.color],
    pattern: item.pattern ?? '纯色',
    thickness: item.thickness ?? adjustThicknessByCategory(item, fabricDefaults.thickness),
    warmIndex: item.warmIndex ?? adjustWarmByCategory(item, fabricDefaults.warmIndex),
    formalityLevel: formality,
    styleTags: styleTags.slice(0, 3),
    sceneTags,
    wearCount: item.wearCount ?? 0,
  }
}

function adjustThicknessByCategory(item: ClothingItem, base: number): number {
  if (item.category === '外套') return Math.min(5, base + 1)
  if (item.category === '内衣') return 1
  if (item.season === '冬') return Math.min(5, base + 1)
  if (item.season === '夏') return Math.max(1, base - 1)
  return base
}

function adjustWarmByCategory(item: ClothingItem, base: number): number {
  if (item.category === '外套') return Math.min(10, base + 2)
  if (item.category === '鞋履') return Math.max(1, base - 1)
  if (item.category === '配饰') return Math.max(1, base - 2)
  if (item.season === '冬') return Math.min(10, base + 2)
  if (item.season === '夏') return Math.max(1, base - 1)
  return base
}

function inferSceneTags(item: ClothingItem): SceneTag[] {
  const tags: SceneTag[] = []
  const style = LEGACY_STYLE_MAP[item.style]

  if (['商务', '极简'].includes(style)) tags.push('通勤', '商务')
  if (style === '休闲') tags.push('居家', '校园')
  if (style === '运动') tags.push('运动')
  if (style === '户外') tags.push('户外', '旅行')
  if (['甜美', '法式', '韩系'].includes(style)) tags.push('约会')
  if (style === '复古') tags.push('聚会')
  if (item.category === '配饰') tags.push('通勤')

  return tags.length > 0 ? [...new Set(tags)] : ['居家']
}

export function normalizeAllItems(items: ClothingItem[]): ClothingItem[] {
  return items.map(normalizeClothingItem)
}

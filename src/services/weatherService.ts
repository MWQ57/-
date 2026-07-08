import type { ClothingItem, WeatherInfo } from '../types'

const WEATHER_CODES: Record<number, string> = {
  0: '晴朗', 1: '大部晴朗', 2: '局部多云', 3: '阴天',
  45: '雾', 48: '雾凇', 51: '小毛毛雨', 53: '毛毛雨', 55: '大毛毛雨',
  61: '小雨', 63: '中雨', 65: '大雨', 71: '小雪', 73: '中雪', 75: '大雪',
  80: '小阵雨', 81: '阵雨', 82: '大阵雨', 95: '雷暴',
}

export interface LocationInfo {
  lat: number
  lon: number
  city: string
}

export const POPULAR_CITIES: LocationInfo[] = [
  { lat: 39.9, lon: 116.4, city: '北京' },
  { lat: 31.23, lon: 121.47, city: '上海' },
  { lat: 23.13, lon: 113.26, city: '广州' },
  { lat: 22.54, lon: 114.06, city: '深圳' },
  { lat: 30.57, lon: 104.07, city: '成都' },
  { lat: 30.59, lon: 114.31, city: '武汉' },
  { lat: 34.26, lon: 108.94, city: '西安' },
  { lat: 29.56, lon: 106.55, city: '重庆' },
  { lat: 36.07, lon: 120.38, city: '青岛' },
  { lat: 30.25, lon: 120.17, city: '杭州' },
  { lat: 32.06, lon: 118.8, city: '南京' },
  { lat: 38.04, lon: 114.48, city: '石家庄' },
]

export async function searchCities(query: string): Promise<LocationInfo[]> {
  if (!query.trim()) return []
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=zh&format=json`
  const res = await fetch(url)
  const data = await res.json()
  if (!data.results) return []
  return data.results.map((r: { name: string; latitude: number; longitude: number; admin1?: string; country?: string }) => ({
    lat: r.latitude,
    lon: r.longitude,
    city: r.admin1 ? `${r.name}（${r.admin1}）` : r.name,
  }))
}

export async function getLocation(): Promise<LocationInfo> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(POPULAR_CITIES[0])
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords
        let city = '当前位置'
        try {
          const res = await fetch(
            `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=zh&count=1`
          )
          const data = await res.json()
          if (data.results?.[0]) {
            city = data.results[0].name || data.results[0].admin1 || city
          }
        } catch { /* use default */ }
        resolve({ lat, lon, city })
      },
      () => resolve(POPULAR_CITIES[0]),
      { timeout: 8000 }
    )
  })
}

export async function fetchWeather(lat: number, lon: number, city: string): Promise<WeatherInfo> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,uv_index&timezone=auto`
  const res = await fetch(url)
  const data = await res.json()
  const c = data.current

  return {
    temperature: Math.round(c.temperature_2m),
    weatherCode: c.weather_code,
    windSpeed: Math.round(c.wind_speed_10m),
    humidity: c.relative_humidity_2m,
    uvIndex: Math.round(c.uv_index ?? 0),
    description: WEATHER_CODES[c.weather_code] ?? '未知',
    city,
  }
}

function isRainy(code: number) {
  return [51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(code)
}

function isSnowy(code: number) {
  return [71, 73, 75].includes(code)
}

export function getWeatherTags(weather: WeatherInfo): string[] {
  const tags: string[] = []
  const t = weather.temperature

  if (t >= 30) tags.push('高温')
  else if (t >= 22) tags.push('温暖')
  else if (t >= 12) tags.push('凉爽')
  else if (t >= 0) tags.push('低温')
  else tags.push('严寒')

  if (isRainy(weather.weatherCode)) tags.push('雨天')
  if (isSnowy(weather.weatherCode)) tags.push('雪天')
  if (weather.windSpeed >= 30) tags.push('大风')
  if (weather.uvIndex >= 6) tags.push('强紫外线')
  if (weather.humidity >= 80) tags.push('高湿度')

  return tags
}

export function scoreItemForWeather(item: ClothingItem, weather: WeatherInfo): number {
  let score = 50
  const t = weather.temperature
  const tags = getWeatherTags(weather)

  const seasonScore: Record<string, Record<string, number>> = {
    '高温': { '夏': 30, '四季': 15, '春': -10, '秋': -20, '冬': -30 },
    '温暖': { '春': 20, '夏': 15, '四季': 20, '秋': 10, '冬': -15 },
    '凉爽': { '秋': 25, '春': 20, '四季': 15, '夏': -10, '冬': 5 },
    '低温': { '秋': 15, '冬': 25, '四季': 10, '春': 5, '夏': -25 },
    '严寒': { '冬': 35, '秋': 10, '四季': 5, '春': -15, '夏': -35 },
  }

  for (const tag of tags) {
    const map = seasonScore[tag]
    if (map) score += map[item.season] ?? 0
  }

  if (tags.includes('雨天')) {
    if (item.fabric === '皮革' || item.category === '外套') score += 15
    if (item.fabric === '丝') score -= 10
    if (item.category === '鞋履') score += 10
  }

  if (tags.includes('大风') && item.category === '外套') score += 20
  if (tags.includes('强紫外线') && ['白色', '米色', '灰色'].includes(item.color)) score += 10
  if (tags.includes('高温') && ['棉', '麻', '涤纶'].includes(item.fabric)) score += 10

  if (item.category === '外套' && t < 18) score += 15
  if (item.category === '外套' && t > 28) score -= 20
  if (['上衣', '连衣裙'].includes(item.category) && t > 25) score += 10
  if (item.status === '常穿') score += 5
  if (item.status === '待清洗') score -= 30

  return score
}

export function recommendForWeather(
  items: ClothingItem[],
  weather: WeatherInfo,
  count = 3
): ClothingItem[][] {
  const available = items.filter((i) => i.status !== '待清洗')
  if (available.length === 0) return []

  const tops = available.filter((i) => ['上衣', '连衣裙'].includes(i.category))
  const bottoms = available.filter((i) => i.category === '下装')
  const outers = available.filter((i) => i.category === '外套')
  const shoes = available.filter((i) => i.category === '鞋履')
  const bags = available.filter((i) => i.category === '包包')

  const outfits: ClothingItem[][] = []

  for (let n = 0; n < count; n++) {
    const outfit: ClothingItem[] = []

    const sortedTops = [...tops].sort(
      (a, b) => scoreItemForWeather(b, weather) - scoreItemForWeather(a, weather)
    )
    const top = sortedTops[n % sortedTops.length] ?? sortedTops[0]
    if (top) outfit.push(top)

    if (top?.category !== '连衣裙') {
      const sortedBottoms = [...bottoms].sort(
        (a, b) => scoreItemForWeather(b, weather) - scoreItemForWeather(a, weather)
      )
      const bottom = sortedBottoms[n % sortedBottoms.length] ?? sortedBottoms[0]
      if (bottom) outfit.push(bottom)
    }

    if (weather.temperature < 20 && outers.length > 0) {
      const sortedOuters = [...outers].sort(
        (a, b) => scoreItemForWeather(b, weather) - scoreItemForWeather(a, weather)
      )
      const outer = sortedOuters[n % sortedOuters.length]
      if (outer) outfit.push(outer)
    }

    if (shoes.length > 0) {
      outfit.push(shoes[n % shoes.length])
    }
    if (bags.length > 0 && n < 2) {
      outfit.push(bags[n % bags.length])
    }

    if (outfit.length >= 2) outfits.push(outfit)
  }

  return outfits
}

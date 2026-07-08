import { useEffect, useState, useCallback } from 'react'
import { CloudSun, RefreshCw, Droplets, Wind, Sun, Thermometer } from 'lucide-react'
import { useWardrobeStore } from '../store/wardrobeStore'
import { fetchWeather, getLocation, getWeatherTags, recommendForWeather, type LocationInfo } from '../services/weatherService'
import type { WeatherInfo } from '../types'
import { OutfitDisplay } from '../components/OutfitDisplay'
import { LocationPicker } from '../components/LocationPicker'
import { saveLocation, loadLocation } from '../services/storage'

export function WeatherPage() {
  const items = useWardrobeStore((s) => s.items)
  const [weather, setWeather] = useState<WeatherInfo | null>(null)
  const [location, setLocation] = useState<LocationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadWeather = useCallback(async (loc?: LocationInfo) => {
    setLoading(true)
    setError('')
    try {
      const target = loc ?? loadLocation() ?? await getLocation()
      saveLocation(target)
      setLocation(target)
      const w = await fetchWeather(target.lat, target.lon, target.city)
      setWeather(w)
    } catch {
      setError('获取天气失败，请检查网络连接')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadWeather() }, [loadWeather])

  const handleLocationChange = (loc: LocationInfo) => {
    loadWeather(loc)
  }

  const outfits = weather ? recommendForWeather(items, weather, 3) : []
  const tags = weather ? getWeatherTags(weather) : []

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CloudSun className="w-5 h-5 text-amber-500" />
            天气穿搭推荐
          </h2>
          <p className="text-sm text-gray-500 mt-1">根据实时天气自动筛选衣橱适配衣物</p>
        </div>
        <button
          onClick={() => loadWeather()}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-white disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </button>
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      {weather && (
        <div className="bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <LocationPicker current={location} onSelect={handleLocationChange} />
              </div>
              <p className="text-5xl font-bold mt-2">{weather.temperature}°</p>
              <p className="text-sky-100 mt-1">{weather.description}</p>
            </div>
            <CloudSun className="w-16 h-16 text-white/30" />
          </div>
          <div className="grid grid-cols-4 gap-3 mt-6">
            <WeatherStat icon={Droplets} label="湿度" value={`${weather.humidity}%`} />
            <WeatherStat icon={Wind} label="风速" value={`${weather.windSpeed} km/h`} />
            <WeatherStat icon={Sun} label="紫外线" value={`${weather.uvIndex}`} />
            <WeatherStat icon={Thermometer} label="体感" value={weather.temperature > 30 ? '炎热' : weather.temperature > 20 ? '舒适' : weather.temperature > 10 ? '凉爽' : '寒冷'} />
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-white/20 rounded-full text-xs backdrop-blur-sm">{tag}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {loading && !weather && (
        <div className="text-center py-12 text-gray-400 animate-pulse-soft">正在获取天气数据...</div>
      )}

      {weather && (
        <section>
          <h3 className="font-semibold text-gray-900 mb-4">今日穿搭方案</h3>
          {items.length === 0 ? (
            <p className="text-center text-gray-400 py-8 bg-white rounded-2xl border border-gray-100">
              请先添加衣物到衣橱
            </p>
          ) : outfits.length === 0 ? (
            <p className="text-center text-gray-400 py-8 bg-white rounded-2xl border border-gray-100">
              暂无合适搭配方案
            </p>
          ) : (
            <div className="space-y-4">
              {outfits.map((outfit, i) => (
                <OutfitDisplay key={i} items={outfit} title="天气推荐" index={i} weather={weather} logSource="weather" />
              ))}
            </div>
          )}
        </section>
      )}

      <section className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">天气穿搭规则</h3>
        <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-600">
          <RuleItem condition="高温 ≥30°C" advice="选择棉麻透气面料，轻薄上衣，避免厚重外套" />
          <RuleItem condition="低温 <12°C" advice="叠穿外套，羊毛/针织保暖单品" />
          <RuleItem condition="雨天" advice="防水外套 + 皮革鞋履，避免丝质面料" />
          <RuleItem condition="大风" advice="防风外套，避免过于宽松的版型" />
          <RuleItem condition="强紫外线" advice="浅色长袖，搭配帽子/墨镜配饰" />
          <RuleItem condition="高湿度" advice="透气吸汗面料，轻薄速干单品" />
        </div>
      </section>
    </div>
  )
}

function WeatherStat({ icon: Icon, label, value }: { icon: typeof Droplets; label: string; value: string }) {
  return (
    <div className="bg-white/15 rounded-xl p-3 text-center backdrop-blur-sm">
      <Icon className="w-4 h-4 mx-auto mb-1 text-white/80" />
      <p className="text-[10px] text-white/70">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  )
}

function RuleItem({ condition, advice }: { condition: string; advice: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-brand-500 font-medium whitespace-nowrap">{condition}</span>
      <span className="text-gray-500">→ {advice}</span>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Plus, Sparkles, CloudSun, Palette, Shirt, ArrowRight, ClipboardCheck, CalendarDays } from 'lucide-react'
import { useWardrobeStore } from '../store/wardrobeStore'
import { fetchWeather, getLocation, recommendForWeather } from '../services/weatherService'
import { loadLocation } from '../services/storage'
import type { WeatherInfo } from '../types'
import { ClothingCard } from '../components/ClothingCard'
import { OutfitDisplay } from '../components/OutfitDisplay'
import type { TabId } from '../components/Layout'

interface HomePageProps {
  onNavigate: (tab: TabId) => void
  onUpload: () => void
}

export function HomePage({ onNavigate, onUpload }: HomePageProps) {
  const items = useWardrobeStore((s) => s.items)
  const logs = useWardrobeStore((s) => s.logs)
  const [weather, setWeather] = useState<WeatherInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const loc = loadLocation() ?? await getLocation()
        const w = await fetchWeather(loc.lat, loc.lon, loc.city)
        if (!cancelled) setWeather(w)
      } catch { /* ignore */ }
      finally { if (!cancelled) setLoading(false) }
    })()
    return () => { cancelled = true }
  }, [])

  const weatherOutfits = weather ? recommendForWeather(items, weather, 1) : []
  const recentItems = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4)

  const features = [
    { icon: Shirt, title: '衣物数字化', desc: '拍照/批量上传，AI 自动识别归档', tab: 'wardrobe' as TabId, color: 'bg-blue-50 text-blue-600' },
    { icon: Sparkles, title: '智能搭配', desc: '选一件单品，自动生成成套方案', tab: 'match' as TabId, color: 'bg-purple-50 text-purple-600' },
    { icon: CloudSun, title: '天气穿搭', desc: '根据实时天气推荐今日穿搭', tab: 'weather' as TabId, color: 'bg-amber-50 text-amber-600' },
    { icon: Palette, title: 'DIY 画布', desc: '自由拖拽，创意搭配', tab: 'canvas' as TabId, color: 'bg-rose-50 text-rose-600' },
    { icon: ClipboardCheck, title: '穿搭标准', desc: '查看颜色、天气、场景评分规则', tab: 'standards' as TabId, color: 'bg-emerald-50 text-emerald-600' },
    { icon: CalendarDays, title: '穿搭日志', desc: '记录每日穿搭，沉淀偏好档案', tab: 'logs' as TabId, color: 'bg-indigo-50 text-indigo-600' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 text-white p-6 sm:p-8">
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">你的私人智能衣橱</h2>
          <p className="text-brand-100 text-sm sm:text-base mb-6 max-w-lg">
            衣物云端数字化管理，AI 智能搭配，天气场景穿搭推荐，自由 DIY 创意画布
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onUpload}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-brand-600 rounded-xl font-semibold text-sm hover:bg-brand-50 transition-colors shadow-lg"
            >
              <Plus className="w-4 h-4" />
              添加衣物
            </button>
            <button
              onClick={() => onNavigate('canvas')}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/20 text-white rounded-xl font-semibold text-sm hover:bg-white/30 transition-colors backdrop-blur-sm"
            >
              <Palette className="w-4 h-4" />
              开始搭配
            </button>
          </div>
        </div>
        <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute right-16 top-4 w-24 h-24 rounded-full bg-white/5" />
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="衣物总数" value={items.length} />
        <StatCard label="常穿单品" value={items.filter((i) => i.status === '常穿').length} />
        <StatCard label="品类覆盖" value={new Set(items.map((i) => i.category)).size} />
        <StatCard label="穿搭日志" value={logs.length} />
      </section>

      {weather && (
        <section className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <CloudSun className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">今日天气穿搭</h3>
                <p className="text-sm text-gray-500">
                  {weather.city} · {weather.description} · {weather.temperature}°C
                </p>
              </div>
            </div>
            <button onClick={() => onNavigate('weather')} className="text-sm text-brand-600 flex items-center gap-1 hover:text-brand-700">
              查看更多 <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {items.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">添加衣物后，即可获取天气穿搭推荐</p>
          ) : weatherOutfits.length > 0 ? (
            <OutfitDisplay items={weatherOutfits[0]} title="今日推荐" weather={weather} logSource="weather" />
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">暂无合适搭配，请补充衣橱单品</p>
          )}
        </section>
      )}

      {loading && !weather && (
        <div className="text-center text-sm text-gray-400 py-4 animate-pulse-soft">正在获取天气信息...</div>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">快捷入口</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {features.map(({ icon: Icon, title, desc, tab, color }) => (
            <button
              key={tab}
              onClick={() => onNavigate(tab)}
              className="text-left p-4 rounded-2xl bg-white border border-gray-100 card-hover"
            >
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="font-semibold text-sm text-gray-900">{title}</p>
              <p className="text-xs text-gray-500 mt-1">{desc}</p>
            </button>
          ))}
        </div>
      </section>

      {recentItems.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">最近添加</h3>
            <button onClick={() => onNavigate('wardrobe')} className="text-sm text-brand-600 flex items-center gap-1">
              全部衣橱 <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {recentItems.map((item) => (
              <ClothingCard key={item.id} item={item} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center card-hover">
      <p className="text-2xl font-bold text-brand-600">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}

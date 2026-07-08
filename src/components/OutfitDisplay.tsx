import { CalendarPlus, Star } from 'lucide-react'
import type { ClothingItem, OutfitLogSource, SceneType, WeatherInfo } from '../types'
import { scoreOutfit } from '../services/scoringEngine'
import { useWardrobeStore } from '../store/wardrobeStore'
import { TransparentImage } from './TransparentImage'

interface OutfitDisplayProps {
  items: ClothingItem[]
  title?: string
  index?: number
  scene?: SceneType
  weather?: WeatherInfo
  logSource?: OutfitLogSource
}

export function OutfitDisplay({ items, title, index, scene, weather, logSource }: OutfitDisplayProps) {
  const logOutfit = useWardrobeStore((s) => s.logOutfit)
  const score = scoreOutfit(items, { scene, weather })
  const topNotes = score.explanation.slice(0, 2)

  const handleLog = () => {
    logOutfit({
      itemIds: items.map((item) => item.id),
      scene,
      weather,
      source: logSource ?? 'match',
      score,
    })
    alert('已记录到今日穿搭日志')
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 card-hover animate-fade-in">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          {title && (
            <h4 className="text-sm font-semibold text-gray-800">
              {title}{index !== undefined ? ` #${index + 1}` : ''}
            </h4>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-semibold text-brand-600">{score.total} 分 · {score.grade}</span>
            <span className="flex">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} className={`w-3 h-3 ${n <= score.stars ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
              ))}
            </span>
          </div>
        </div>
        <button
          onClick={handleLog}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-600 text-xs font-medium hover:bg-brand-100"
        >
          <CalendarPlus className="w-3.5 h-3.5" />
          记录
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {items.map((item) => (
          <div key={item.id} className="flex-shrink-0 w-20 text-center">
            <TransparentImage
              src={item.imageUrl}
              alt={item.name}
              containerClassName="w-20 h-24 rounded-xl overflow-hidden border border-gray-100"
              className="w-full h-full object-contain p-0.5"
            />
            <p className="text-[10px] text-gray-500 mt-1 truncate">{item.name}</p>
            <p className="text-[10px] text-brand-500">{item.category}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-1.5 mt-3">
        <ScorePill label="颜色" value={score.colorHarmony} max={30} />
        <ScorePill label="风格" value={score.styleUnity} max={25} />
        <ScorePill label="天气" value={score.weatherFit} max={20} />
        <ScorePill label="场景" value={score.sceneFit} max={15} />
        <ScorePill label="完整" value={score.layering} max={10} />
      </div>
      {topNotes.length > 0 && (
        <div className="mt-3 space-y-1">
          {topNotes.map((note) => (
            <p key={note} className="text-xs text-gray-500">{note}</p>
          ))}
        </div>
      )}
    </div>
  )
}

function ScorePill({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="rounded-lg bg-gray-50 px-2 py-1 text-center">
      <p className="text-[10px] text-gray-400">{label}</p>
      <p className="text-xs font-semibold text-gray-700">{value}/{max}</p>
    </div>
  )
}

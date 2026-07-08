import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { useWardrobeStore } from '../store/wardrobeStore'
import { recommendForScene } from '../services/outfitMatcher'
import { SCENES, type SceneType } from '../types'
import { OutfitDisplay } from '../components/OutfitDisplay'

const SCENE_INFO: Record<SceneType, { emoji: string; desc: string }> = {
  '通勤办公': { emoji: '💼', desc: '简约干练，专业得体' },
  '日常休闲': { emoji: '☕', desc: '舒适自在，轻松随性' },
  '社交约会': { emoji: '💕', desc: '精致优雅，展现魅力' },
  '正式场合': { emoji: '🎩', desc: '端庄大方，礼仪得体' },
  '运动户外': { emoji: '🏃', desc: '轻便透气，活动自如' },
  '季节节日': { emoji: '🎉', desc: '氛围感满满，应景穿搭' },
}

export function ScenePage() {
  const items = useWardrobeStore((s) => s.items)
  const [scene, setScene] = useState<SceneType>('通勤办公')

  const outfits = recommendForScene(items, scene, 3)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-brand-500" />
          场景穿搭推荐
        </h2>
        <p className="text-sm text-gray-500 mt-1">选择出行场景，从个人衣橱获取专属穿搭方案</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {SCENES.map((s) => {
          const info = SCENE_INFO[s]
          return (
            <button
              key={s}
              onClick={() => setScene(s)}
              className={`p-4 rounded-2xl border text-left transition-all card-hover ${
                scene === s
                  ? 'bg-brand-50 border-brand-300 ring-2 ring-brand-200'
                  : 'bg-white border-gray-100'
              }`}
            >
              <span className="text-2xl">{info.emoji}</span>
              <p className="font-semibold text-sm text-gray-900 mt-2">{s}</p>
              <p className="text-xs text-gray-500 mt-0.5">{info.desc}</p>
            </button>
          )
        })}
      </div>

      <section>
        <h3 className="font-semibold text-gray-900 mb-4">
          「{scene}」穿搭方案
        </h3>
        {items.length === 0 ? (
          <p className="text-center text-gray-400 py-12 bg-white rounded-2xl border border-gray-100">
            请先添加衣物到衣橱
          </p>
        ) : outfits.length === 0 ? (
          <p className="text-center text-gray-400 py-12 bg-white rounded-2xl border border-gray-100">
            暂无匹配该场景的穿搭，请补充对应风格单品
          </p>
        ) : (
          <div className="space-y-4">
            {outfits.map((outfit, i) => (
              <OutfitDisplay key={i} items={outfit} title={scene} index={i} scene={scene} logSource="scene" />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

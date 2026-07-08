import { useState } from 'react'
import { Sparkles, Save } from 'lucide-react'
import { useWardrobeStore } from '../store/wardrobeStore'
import { generateOutfits } from '../services/outfitMatcher'
import { ClothingCard } from '../components/ClothingCard'
import { TransparentImage } from '../components/TransparentImage'
import { OutfitDisplay } from '../components/OutfitDisplay'
import type { ClothingItem } from '../types'

export function MatchPage() {
  const items = useWardrobeStore((s) => s.items)
  const addOutfit = useWardrobeStore((s) => s.addOutfit)
  const [selected, setSelected] = useState<ClothingItem | null>(null)
  const [outfits, setOutfits] = useState<ClothingItem[][]>([])

  const handleSelect = (item: ClothingItem) => {
    setSelected(item)
    setOutfits(generateOutfits(items, item, 4))
  }

  const handleSave = (outfit: ClothingItem[], index: number) => {
    addOutfit(`${selected?.name} 搭配方案 ${index + 1}`, outfit.map((i) => i.id))
    alert('搭配方案已保存')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-500" />
          AI 智能搭配
        </h2>
        <p className="text-sm text-gray-500 mt-1">选择一件单品，系统自动匹配下装、外套、鞋包，生成多套穿搭方案</p>
      </div>

      {items.length < 2 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-500">至少需要 2 件衣物才能进行智能搭配</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">选择基础单品</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1">
              {items.filter((i) => i.status !== '待清洗').map((item) => (
                <ClothingCard
                  key={item.id}
                  item={item}
                  compact
                  selected={selected?.id === item.id}
                  onClick={() => handleSelect(item)}
                />
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            {!selected ? (
              <div className="flex items-center justify-center h-64 bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400 text-sm">← 请先选择一件衣物</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-brand-50 rounded-xl p-3 flex items-center gap-3">
                  <TransparentImage
                    src={selected.imageUrl}
                    alt=""
                    containerClassName="w-12 h-14 rounded-lg overflow-hidden"
                    className="w-full h-full object-contain"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">基于「{selected.name}」生成搭配</p>
                    <p className="text-xs text-gray-500">{selected.category} · {selected.color} · {selected.style}</p>
                  </div>
                </div>

                {outfits.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">暂无可用搭配，请补充更多单品</p>
                ) : (
                  outfits.map((outfit, i) => (
                    <div key={i} className="relative group">
                      <OutfitDisplay items={outfit} title="搭配方案" index={i} logSource="match" />
                      <button
                        onClick={() => handleSave(outfit, i)}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-3 py-1.5 bg-brand-500 text-white text-xs rounded-lg hover:bg-brand-600"
                      >
                        <Save className="w-3 h-3" /> 保存
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

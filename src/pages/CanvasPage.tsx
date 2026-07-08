import { useState, useRef, useCallback, useEffect } from 'react'
import { Palette, RotateCcw, Save, Lightbulb, Layers, Trash2, Eye } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useWardrobeStore } from '../store/wardrobeStore'
import { getOutfitTip } from '../services/outfitMatcher'
import type { CanvasItem, CanvasLayer, ClothingItem, SavedCanvas } from '../types'
import { TransparentImage } from '../components/TransparentImage'

const LAYER_ORDER: CanvasLayer[] = ['内搭', '中层', '外套']
const LAYER_Z: Record<CanvasLayer, number> = { '内搭': 1, '中层': 2, '外套': 3 }

export function CanvasPage() {
  const items = useWardrobeStore((s) => s.items)
  const { saveCanvas, canvases, deleteCanvas } = useWardrobeStore()
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [compareList, setCompareList] = useState<SavedCanvas[]>([])
  const [showCompare, setShowCompare] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null)

  const canvasClothing = canvasItems
    .map((ci) => ({ ci, clothing: items.find((i) => i.id === ci.clothingId) }))
    .filter((x): x is { ci: CanvasItem; clothing: ClothingItem } => !!x.clothing)
    .sort((a, b) => a.ci.zIndex - b.ci.zIndex)

  const tipItems = canvasClothing.map((x) => x.clothing)
  const tip = getOutfitTip(tipItems)

  const addToCanvas = (clothing: ClothingItem) => {
    const layer: CanvasLayer =
      clothing.category === '外套' ? '外套'
      : clothing.category === '上衣' ? '中层'
      : '内搭'

    const newItem: CanvasItem = {
      id: uuidv4(),
      clothingId: clothing.id,
      x: 100 + Math.random() * 80,
      y: 80 + Math.random() * 60,
      width: clothing.category === '鞋履' || clothing.category === '包包' ? 80 : 120,
      height: clothing.category === '鞋履' || clothing.category === '包包' ? 80 : 140,
      layer,
      zIndex: LAYER_Z[layer] * 10 + canvasItems.length,
    }
    setCanvasItems((prev) => [...prev, newItem])
    setSelectedId(newItem.id)
  }

  const removeItem = (id: string) => {
    setCanvasItems((prev) => prev.filter((i) => i.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const changeLayer = (id: string, layer: CanvasLayer) => {
    setCanvasItems((prev) =>
      prev.map((i) => i.id === id ? { ...i, layer, zIndex: LAYER_Z[layer] * 10 + i.zIndex % 10 } : i)
    )
  }

  const handleReset = () => {
    if (canvasItems.length === 0 || confirm('确定清空画布？')) {
      setCanvasItems([])
      setSelectedId(null)
    }
  }

  const handleSave = () => {
    const name = prompt('为这套搭配命名：', `DIY搭配 ${new Date().toLocaleDateString()}`)
    if (name) {
      saveCanvas(name, canvasItems)
      alert('搭配方案已保存')
    }
  }

  const handlePointerDown = useCallback((e: React.PointerEvent, id: string) => {
    e.preventDefault()
    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    dragRef.current = { id, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top }
    target.setPointerCapture(e.pointerId)
    setSelectedId(id)
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current || !canvasRef.current) return
    const canvasRect = canvasRef.current.getBoundingClientRect()
    const { id, offsetX, offsetY } = dragRef.current
    const x = e.clientX - canvasRect.left - offsetX
    const y = e.clientY - canvasRect.top - offsetY
    setCanvasItems((prev) =>
      prev.map((i) => i.id === id ? { ...i, x: Math.max(0, x), y: Math.max(0, y) } : i)
    )
  }, [])

  const handlePointerUp = useCallback(() => {
    dragRef.current = null
  }, [])

  const toggleCompare = (canvas: SavedCanvas) => {
    setCompareList((prev) => {
      const exists = prev.find((c) => c.id === canvas.id)
      if (exists) return prev.filter((c) => c.id !== canvas.id)
      if (prev.length >= 3) return prev
      return [...prev, canvas]
    })
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedId) removeItem(selectedId)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId])

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Palette className="w-5 h-5 text-rose-500" />
            DIY 搭配画布
          </h2>
          <p className="text-sm text-gray-500 mt-1">拖拽单品自由组合，调节层级还原叠穿效果</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleReset} className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-white">
            <RotateCcw className="w-3.5 h-3.5" /> 重置
          </button>
          <button onClick={handleSave} disabled={canvasItems.length === 0} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-brand-500 text-white text-sm hover:bg-brand-600 disabled:opacity-40">
            <Save className="w-3.5 h-3.5" /> 保存
          </button>
          <button onClick={() => setShowCompare(!showCompare)} className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-white">
            <Eye className="w-3.5 h-3.5" /> 对比
          </button>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
        <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-amber-800">{tip}</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 p-3 max-h-[70vh] overflow-y-auto">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">衣橱单品</h3>
          <p className="text-xs text-gray-400 mb-3">点击添加到画布</p>
          <div className="grid grid-cols-2 gap-2">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => addToCanvas(item)}
                className="rounded-xl overflow-hidden border border-gray-100 hover:border-brand-300 transition-colors"
              >
                <TransparentImage
                  src={item.imageUrl}
                  alt={item.name}
                  containerClassName="w-full aspect-square"
                  className="w-full h-full object-contain p-0.5"
                />
                <p className="text-[10px] text-gray-500 p-1 truncate">{item.name}</p>
              </button>
            ))}
          </div>
          {items.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">暂无衣物</p>
          )}
        </div>

        <div className="lg:col-span-2">
          <div
            ref={canvasRef}
            className="relative rounded-2xl border-2 border-dashed border-gray-200 min-h-[500px] overflow-hidden"
            style={{
              backgroundColor: '#f0ece8',
              backgroundImage: `
                linear-gradient(45deg, #e0dbd5 25%, transparent 25%),
                linear-gradient(-45deg, #e0dbd5 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #e0dbd5 75%),
                linear-gradient(-45deg, transparent 75%, #e0dbd5 75%)
              `,
              backgroundSize: '16px 16px',
              backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
            }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onClick={() => setSelectedId(null)}
          >
            {canvasClothing.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-400 text-sm">从左侧点击单品添加到画布，可自由拖拽摆放</p>
              </div>
            )}

            {canvasClothing.map(({ ci, clothing }) => (
              <div
                key={ci.id}
                className={`canvas-item absolute transition-shadow ${
                  selectedId === ci.id ? 'ring-2 ring-brand-500 ring-offset-1 rounded-lg' : ''
                }`}
                style={{
                  left: ci.x, top: ci.y, width: ci.width, height: ci.height, zIndex: ci.zIndex,
                }}
                onPointerDown={(e) => { e.stopPropagation(); handlePointerDown(e, ci.id) }}
                onClick={(e) => { e.stopPropagation(); setSelectedId(ci.id) }}
              >
                <img src={clothing.imageUrl} alt={clothing.name} className="w-full h-full object-contain pointer-events-none drop-shadow-md" draggable={false} />
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[9px] px-2 py-0.5 rounded-full whitespace-nowrap">
                  {ci.layer}
                </span>
              </div>
            ))}
          </div>

          {selectedId && (
            <div className="mt-3 flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100">
              <Layers className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">层级：</span>
              {LAYER_ORDER.map((layer) => (
                <button
                  key={layer}
                  onClick={() => changeLayer(selectedId, layer)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    canvasItems.find((i) => i.id === selectedId)?.layer === layer
                      ? 'bg-brand-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {layer}
                </button>
              ))}
              <button
                onClick={() => removeItem(selectedId)}
                className="ml-auto flex items-center gap-1 px-3 py-1 rounded-lg text-xs text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-3 h-3" /> 删除
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">已保存方案</h3>
            {canvases.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">暂无保存</p>
            ) : (
              <div className="space-y-2">
                {canvases.map((c) => (
                  <div key={c.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 group">
                    <button
                      onClick={() => setCanvasItems(c.items)}
                      className="flex-1 text-left text-sm text-gray-700 truncate hover:text-brand-600"
                    >
                      {c.name}
                    </button>
                    <button
                      onClick={() => toggleCompare(c)}
                      className={`text-[10px] px-2 py-0.5 rounded ${
                        compareList.find((x) => x.id === c.id) ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      对比
                    </button>
                    <button
                      onClick={() => deleteCanvas(c.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {showCompare && compareList.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-3 animate-fade-in">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">方案对比 ({compareList.length}/3)</h3>
              <div className="space-y-3">
                {compareList.map((c) => (
                  <div key={c.id}>
                    <p className="text-xs font-medium text-gray-600 mb-1">{c.name}</p>
                    <div className="flex gap-1">
                      {c.items.map((ci) => {
                        const clothing = items.find((i) => i.id === ci.clothingId)
                        if (!clothing) return null
                        return (
                          <img key={ci.id} src={clothing.imageUrl} alt="" className="w-10 h-12 object-cover rounded" />
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

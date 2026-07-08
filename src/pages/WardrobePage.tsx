import { useState, useMemo } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import { useWardrobeStore } from '../store/wardrobeStore'
import { ClothingCard } from '../components/ClothingCard'
import { CATEGORIES, COLORS, SEASONS, STYLES, STATUSES } from '../types'
import type { ClothingItem } from '../types'
import { TransparentImage } from '../components/TransparentImage'

interface WardrobePageProps {
  onUpload: () => void
}

export function WardrobePage({ onUpload }: WardrobePageProps) {
  const { items, updateItem, deleteItem } = useWardrobeStore()
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [category, setCategory] = useState('')
  const [color, setColor] = useState('')
  const [season, setSeason] = useState('')
  const [style, setStyle] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState<ClothingItem | null>(null)

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (search && !item.name.includes(search) && !item.tags.some((t) => t.includes(search))) return false
      if (category && item.category !== category) return false
      if (color && item.color !== color) return false
      if (season && item.season !== season) return false
      if (style && item.style !== style) return false
      if (status && item.status !== status) return false
      return true
    })
  }, [items, search, category, color, season, style, status])

  const grouped = useMemo(() => {
    const map = new Map<string, ClothingItem[]>()
    for (const item of filtered) {
      const list = map.get(item.category) ?? []
      list.push(item)
      map.set(item.category, list)
    }
    return map
  }, [filtered])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">我的衣橱</h2>
          <p className="text-sm text-gray-500 mt-0.5">共 {items.length} 件衣物 · 云端本地同步</p>
        </div>
        <button
          onClick={onUpload}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-xl font-medium text-sm hover:bg-brand-600 transition-colors shadow-md shadow-brand-500/20 self-start"
        >
          <Plus className="w-4 h-4" />
          添加衣物
        </button>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索名称、标签..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2.5 rounded-xl border text-sm font-medium flex items-center gap-1.5 transition-colors ${
            showFilters ? 'bg-brand-50 border-brand-300 text-brand-600' : 'bg-white border-gray-200 text-gray-600'
          }`}
        >
          <Filter className="w-4 h-4" />
          筛选
        </button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 grid grid-cols-2 sm:grid-cols-5 gap-3 animate-fade-in">
          <FilterSelect label="品类" value={category} options={CATEGORIES} onChange={setCategory} />
          <FilterSelect label="颜色" value={color} options={COLORS} onChange={setColor} />
          <FilterSelect label="季节" value={season} options={SEASONS} onChange={setSeason} />
          <FilterSelect label="风格" value={style} options={STYLES} onChange={setStyle} />
          <FilterSelect label="状态" value={status} options={STATUSES} onChange={setStatus} />
        </div>
      )}

      {items.length === 0 ? (
        <EmptyWardrobe onUpload={onUpload} />
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-12">没有匹配的衣物，试试调整筛选条件</p>
      ) : (
        Array.from(grouped.entries()).map(([cat, catItems]) => (
          <section key={cat}>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-brand-500 rounded-full" />
              {cat}
              <span className="text-gray-400 font-normal">({catItems.length})</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {catItems.map((item) => (
                <ClothingCard
                  key={item.id}
                  item={item}
                  onClick={() => setSelected(item)}
                  onDelete={() => { if (confirm('确定删除这件衣物？')) deleteItem(item.id) }}
                />
              ))}
            </div>
          </section>
        ))
      )}

      {selected && (
        <ItemDetailModal
          item={selected}
          onClose={() => setSelected(null)}
          onUpdate={(updates) => { updateItem(selected.id, updates); setSelected({ ...selected, ...updates }) }}
          onDelete={() => { deleteItem(selected.id); setSelected(null) }}
        />
      )}
    </div>
  )
}

function FilterSelect({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-2 rounded-lg border border-gray-200 text-sm bg-white"
      >
        <option value="">全部</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function EmptyWardrobe({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
        <Plus className="w-8 h-8 text-brand-400" />
      </div>
      <h3 className="font-semibold text-gray-800 mb-2">衣橱还是空的</h3>
      <p className="text-sm text-gray-500 mb-6">拍照或上传衣物照片，AI 将自动识别并归档</p>
      <button onClick={onUpload} className="px-6 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-medium hover:bg-brand-600">
        开始添加
      </button>
    </div>
  )
}

function ItemDetailModal({ item, onClose, onUpdate, onDelete }: {
  item: ClothingItem
  onClose: () => void
  onUpdate: (u: Partial<ClothingItem>) => void
  onDelete: () => void
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="p-5">
          <TransparentImage
            src={item.imageUrl}
            alt={item.name}
            containerClassName="w-full aspect-[3/4] rounded-xl overflow-hidden mb-4"
            className="w-full h-full object-contain p-2"
          />
          <h3 className="text-lg font-bold text-gray-900 mb-3">{item.name}</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {([
              ['品类', 'category', CATEGORIES],
              ['颜色', 'color', COLORS],
              ['面料', 'fabric', ['棉', '麻', '丝', '羊毛', '涤纶', '牛仔', '针织', '皮革', '混纺', '其他']],
              ['风格', 'style', STYLES],
              ['季节', 'season', SEASONS],
              ['版型', 'fit', ['修身', '宽松', '标准', 'oversize']],
            ] as const).map(([label, key, opts]) => (
              <div key={key}>
                <label className="text-xs text-gray-500">{label}</label>
                <select
                  value={item[key]}
                  onChange={(e) => onUpdate({ [key]: e.target.value })}
                  className="w-full mt-1 px-2 py-1.5 rounded-lg border border-gray-200 text-sm"
                >
                  {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-500">状态</label>
              <select
                value={item.status}
                onChange={(e) => onUpdate({ status: e.target.value as ClothingItem['status'] })}
                className="w-full mt-1 px-2 py-1.5 rounded-lg border border-gray-200 text-sm"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onDelete} className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50">
              删除
            </button>
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600">
              完成
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

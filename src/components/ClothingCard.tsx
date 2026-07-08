import type { ClothingItem } from '../types'
import { TransparentImage } from './TransparentImage'

interface ClothingCardProps {
  item: ClothingItem
  selected?: boolean
  compact?: boolean
  onClick?: () => void
  onDelete?: () => void
}

const STATUS_COLORS: Record<string, string> = {
  '常穿': 'bg-green-100 text-green-700',
  '闲置': 'bg-gray-100 text-gray-600',
  '待清洗': 'bg-amber-100 text-amber-700',
}

export function ClothingCard({ item, selected, compact, onClick, onDelete }: ClothingCardProps) {
  return (
    <div
      onClick={onClick}
      className={`relative group rounded-2xl overflow-hidden bg-white shadow-sm border card-hover cursor-pointer ${
        selected ? 'ring-2 ring-brand-500 border-brand-300' : 'border-gray-100'
      }`}
    >
      <div className={`relative ${compact ? 'aspect-square' : 'aspect-[3/4]'} overflow-hidden`}>
        <TransparentImage
          src={item.imageUrl}
          alt={item.name}
          containerClassName="w-full h-full"
          className="w-full h-full object-contain p-1"
        />
        <div className="absolute top-2 left-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[item.status]}`}>
            {item.status}
          </span>
        </div>
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-500"
          >
            ×
          </button>
        )}
      </div>
      {!compact && (
        <div className="p-3">
          <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            <span className="text-[10px] px-1.5 py-0.5 bg-brand-50 text-brand-600 rounded">{item.category}</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{item.color}</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{item.season}</span>
          </div>
        </div>
      )}
    </div>
  )
}

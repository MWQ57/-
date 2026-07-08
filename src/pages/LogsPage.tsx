import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { CalendarDays, Camera, Plus, Star, Trash2, Upload } from 'lucide-react'
import { useWardrobeStore } from '../store/wardrobeStore'
import { fileToDataUrl } from '../services/storage'
import { SCENES, type ClothingItem, type SceneType } from '../types'
import { TransparentImage } from '../components/TransparentImage'

interface LogsPageProps {
  onUpload: () => void
}

export function LogsPage({ onUpload }: LogsPageProps) {
  const { items, logs, logOutfit, deleteLog } = useWardrobeStore()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [scene, setScene] = useState<SceneType>('日常休闲')
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(4)
  const [note, setNote] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const sortedLogs = [...logs].sort((a, b) => b.wornAt.localeCompare(a.wornAt) || b.createdAt.localeCompare(a.createdAt))
  const totalWears = items.reduce((sum, item) => sum + (item.wearCount ?? 0), 0)
  const favorite = [...items].sort((a, b) => (b.wearCount ?? 0) - (a.wearCount ?? 0))[0]

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const handlePhoto = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    setPhotoUrl(await fileToDataUrl(file))
  }

  const handleSave = () => {
    if (selectedIds.length === 0 && !photoUrl) {
      alert('请选择衣物或上传一张今日穿搭照片')
      return
    }

    logOutfit({
      itemIds: selectedIds,
      wornAt: date,
      photoUrl,
      scene,
      note: note.trim() || undefined,
      rating,
      source: 'manual',
    })

    setSelectedIds([])
    setPhotoUrl('')
    setNote('')
    setRating(4)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-brand-500" />
            每日穿搭日志
          </h2>
          <p className="text-sm text-gray-500 mt-1">记录每天穿了什么，系统会学习你的偏好和单品使用频率</p>
        </div>
        <button
          onClick={onUpload}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 self-start"
        >
          <Plus className="w-4 h-4" />
          先添加衣物
        </button>
      </div>

      <section className="grid grid-cols-3 gap-3">
        <Stat label="记录天数" value={logs.length} />
        <Stat label="累计穿着" value={totalWears} />
        <Stat label="最常穿" value={favorite?.name ?? '暂无'} small />
      </section>

      <section className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
          <h3 className="font-semibold text-gray-900">新增今日穿搭</h3>

          <button
            onClick={() => fileRef.current?.click()}
            className="w-full min-h-48 rounded-2xl border-2 border-dashed border-gray-200 hover:border-brand-300 bg-gray-50 flex flex-col items-center justify-center gap-2 overflow-hidden"
          >
            {photoUrl ? (
              <img src={photoUrl} alt="今日穿搭" className="w-full h-56 object-cover" />
            ) : (
              <>
                <Camera className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-500">上传整套穿搭照片</span>
              </>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handlePhoto(e.target.files)} />

          <div className="grid grid-cols-2 gap-3">
            <Field label="日期">
              <input value={date} onChange={(e) => setDate(e.target.value)} type="date" className="input" />
            </Field>
            <Field label="场景">
              <select value={scene} onChange={(e) => setScene(e.target.value as SceneType)} className="input">
                {SCENES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          <Field label="满意度">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n as 1 | 2 | 3 | 4 | 5)} className="p-1">
                  <Star className={`w-6 h-6 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
          </Field>

          <Field label="备注">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例如：今天开会，外套有点热，下次换薄一点"
              className="input min-h-20 resize-none"
            />
          </Field>

          <button onClick={handleSave} className="w-full py-3 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600">
            保存日志
          </button>
        </div>

        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">选择今日单品</h3>
            <span className="text-xs text-gray-400">已选 {selectedIds.length} 件</span>
          </div>
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Upload className="w-8 h-8 mx-auto mb-2" />
              先添加衣物后，可以把单品关联到日志
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-[520px] overflow-y-auto pr-1">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`rounded-xl border p-1 text-left transition-all ${
                    selectedIds.includes(item.id) ? 'border-brand-400 ring-2 ring-brand-100 bg-brand-50' : 'border-gray-100 hover:border-brand-200'
                  }`}
                >
                  <TransparentImage
                    src={item.imageUrl}
                    alt={item.name}
                    containerClassName="w-full aspect-square rounded-lg overflow-hidden"
                    className="w-full h-full object-contain"
                  />
                  <p className="text-[11px] text-gray-700 mt-1 truncate">{item.name}</p>
                  <p className="text-[10px] text-gray-400">{item.category}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-gray-900 mb-4">历史记录</h3>
        {sortedLogs.length === 0 ? (
          <p className="text-center text-gray-400 py-12 bg-white rounded-2xl border border-gray-100">
            还没有穿搭日志，记录第一套后这里会形成你的风格档案
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {sortedLogs.map((log) => {
              const logItems = log.itemIds.map((id) => items.find((item) => item.id === id)).filter(Boolean) as ClothingItem[]
              return (
                <article key={log.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                  <div className="flex gap-3">
                    {log.photoUrl ? (
                      <img src={log.photoUrl} alt="穿搭日志" className="w-24 h-28 rounded-xl object-cover bg-gray-100" />
                    ) : (
                      <div className="w-24 h-28 rounded-xl bg-brand-50 flex items-center justify-center text-brand-300">
                        <CalendarDays className="w-8 h-8" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-gray-900">{log.wornAt}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{log.scene ?? '未指定场景'} · {log.score?.total ?? 0} 分</p>
                        </div>
                        <button onClick={() => deleteLog(log.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex gap-0.5 mt-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} className={`w-3.5 h-3.5 ${n <= (log.rating ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      {log.note && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{log.note}</p>}
                    </div>
                  </div>
                  {logItems.length > 0 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto">
                      {logItems.map((item) => (
                        <TransparentImage
                          key={item.id}
                          src={item.imageUrl}
                          alt={item.name}
                          containerClassName="w-12 h-14 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0"
                          className="w-full h-full object-contain"
                        />
                      ))}
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function Stat({ label, value, small }: { label: string; value: string | number; small?: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
      <p className={`font-bold text-brand-600 truncate ${small ? 'text-base' : 'text-2xl'}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-gray-500 mb-1 block">{label}</span>
      {children}
    </label>
  )
}

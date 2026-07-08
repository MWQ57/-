import { useState, useRef, useCallback } from 'react'
import { Camera, Upload, X, Loader2, Check, Edit3 } from 'lucide-react'
import type { AIRecognitionResult } from '../types'
import { CATEGORIES, COLORS, FABRICS, STYLES, SEASONS, FITS } from '../types'
import { recognizeClothing } from '../services/aiRecognition'
import { removeImageBackground } from '../services/backgroundRemoval'
import { fileToDataUrl } from '../services/storage'
import { useWardrobeStore } from '../store/wardrobeStore'
import { TransparentImage } from './TransparentImage'

interface UploadModalProps {
  open: boolean
  onClose: () => void
}

type Step = 'choose' | 'camera' | 'processing' | 'review'

export function UploadModal({ open, onClose }: UploadModalProps) {
  const addItem = useWardrobeStore((s) => s.addItem)
  const [step, setStep] = useState<Step>('choose')
  const [imageUrl, setImageUrl] = useState('')
  const [result, setResult] = useState<AIRecognitionResult | null>(null)
  const [editing, setEditing] = useState(false)
  const [processMsg, setProcessMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const reset = useCallback(() => {
    setStep('choose')
    setImageUrl('')
    setResult(null)
    setEditing(false)
    setProcessMsg('')
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  const handleClose = () => {
    reset()
    onClose()
  }

  const processImage = async (rawUrl: string, filename: string) => {
    setImageUrl(rawUrl)
    setStep('processing')
    setProcessMsg('准备处理图片...')

    try {
      const transparentUrl = await removeImageBackground(rawUrl, setProcessMsg)
      setImageUrl(transparentUrl)
      setProcessMsg('AI 正在识别衣物信息...')
      const ai = await recognizeClothing(transparentUrl, filename)
      setResult(ai)
      setStep('review')
    } catch {
      setProcessMsg('抠图失败，使用原图识别...')
      const ai = await recognizeClothing(rawUrl, filename)
      setResult(ai)
      setImageUrl(rawUrl)
      setStep('review')
    }
  }

  const processFile = async (file: File) => {
    const url = await fileToDataUrl(file)
    await processImage(url, file.name)
  }

  const handleFiles = async (files: FileList) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (arr.length === 0) return

    for (let i = 0; i < arr.length; i++) {
      await processFile(arr[i])
      if (i < arr.length - 1) {
        await new Promise((r) => setTimeout(r, 300))
      }
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      setStep('camera')
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream
      }, 100)
    } catch {
      alert('无法访问摄像头，请检查权限或使用相册上传')
    }
  }

  const capturePhoto = async () => {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    const url = canvas.toDataURL('image/jpeg', 0.9)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    await processImage(url, 'camera-capture.jpg')
  }

  const handleSave = () => {
    if (!result || !imageUrl) return
    addItem({
      name: result.name,
      imageUrl,
      category: result.category,
      color: result.color,
      fabric: result.fabric,
      style: result.style,
      season: result.season,
      fit: result.fit,
      status: '常穿',
      tags: [],
    })
    reset()
    setStep('choose')
    onClose()
  }

  const updateField = <K extends keyof AIRecognitionResult>(key: K, value: AIRecognitionResult[K]) => {
    if (!result) return
    setResult({ ...result, [key]: value })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">添加衣物</h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {step === 'choose' && (
            <div className="space-y-4">
              <button
                onClick={startCamera}
                className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-dashed border-brand-200 hover:border-brand-400 hover:bg-brand-50 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center group-hover:bg-brand-200 transition-colors">
                  <Camera className="w-6 h-6 text-brand-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">实时拍照上传</p>
                  <p className="text-sm text-gray-500">拍摄后自动抠图去背景</p>
                </div>
              </button>

              <button
                onClick={() => fileRef.current?.click()}
                className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-dashed border-gray-200 hover:border-brand-300 hover:bg-gray-50 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                  <Upload className="w-6 h-6 text-gray-600 group-hover:text-brand-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">批量相册上传</p>
                  <p className="text-sm text-gray-500">上传后自动抠图，生成透明底</p>
                </div>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
            </div>
          )}

          {step === 'camera' && (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-[3/4]">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { reset(); setStep('choose') }} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium">
                  返回
                </button>
                <button onClick={capturePhoto} className="flex-1 py-3 rounded-xl bg-brand-500 text-white font-medium hover:bg-brand-600">
                  拍摄
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center py-12 gap-4">
              {imageUrl && (
                <TransparentImage
                  src={imageUrl}
                  alt=""
                  containerClassName="w-32 h-40 rounded-xl overflow-hidden"
                  className="w-full h-full object-contain"
                />
              )}
              <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
              <p className="text-gray-600 font-medium">{processMsg || '处理中...'}</p>
              <p className="text-sm text-gray-400">抠图 + 识别品类、颜色、面料、风格</p>
            </div>
          )}

          {step === 'review' && result && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <TransparentImage
                  src={imageUrl}
                  alt=""
                  containerClassName="w-28 h-36 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0"
                  className="w-full h-full object-contain"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">
                      识别完成 ({Math.round(result.confidence * 100)}%)
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">已自动移除背景，透明底存档</p>
                  <button
                    onClick={() => setEditing(!editing)}
                    className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    {editing ? '完成编辑' : '人工微调'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="名称" value={result.name} editing={editing} onChange={(v) => updateField('name', v)} />
                <Field label="品类" value={result.category} editing={editing} options={CATEGORIES} onChange={(v) => updateField('category', v as typeof result.category)} />
                <Field label="颜色" value={result.color} editing={editing} options={COLORS} onChange={(v) => updateField('color', v as typeof result.color)} />
                <Field label="面料" value={result.fabric} editing={editing} options={FABRICS} onChange={(v) => updateField('fabric', v as typeof result.fabric)} />
                <Field label="风格" value={result.style} editing={editing} options={STYLES} onChange={(v) => updateField('style', v as typeof result.style)} />
                <Field label="季节" value={result.season} editing={editing} options={SEASONS} onChange={(v) => updateField('season', v as typeof result.season)} />
                <Field label="版型" value={result.fit} editing={editing} options={FITS} onChange={(v) => updateField('fit', v as typeof result.fit)} />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => { reset(); setStep('choose') }} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium">
                  继续添加
                </button>
                <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-brand-500 text-white font-medium hover:bg-brand-600">
                  保存到衣橱
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({
  label, value, editing, options, onChange,
}: {
  label: string
  value: string
  editing: boolean
  options?: string[]
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      {editing ? (
        options ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
          >
            {options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
        )
      ) : (
        <p className="text-sm font-medium text-gray-800 px-1">{value}</p>
      )}
    </div>
  )
}

import type { ReactNode } from 'react'
import { Award, CloudSun, Layers3, Palette, Shirt, SlidersHorizontal } from 'lucide-react'
import { FORMALITY_LABELS, getRecommendedWarmRange, RECOMMEND_WEIGHTS, STANDARD_STYLES } from '../standards'

const weatherRows = [
  { temp: 33, label: '炎热 30°C+', advice: '保暖指数 1-2，棉/麻/速干，浅色优先，避免厚外套' },
  { temp: 24, label: '温暖 20-29°C', advice: '保暖指数 2-4，单层上衣或轻薄外套，透气性优先' },
  { temp: 14, label: '凉爽 10-19°C', advice: '保暖指数 4-7，上衣+外套，注意早晚温差' },
  { temp: 3, label: '寒冷 0-9°C', advice: '保暖指数 7-10，外套/针织/羊毛，鞋履保暖' },
]

const sceneRows = [
  { scene: '通勤办公', formality: '6-7', keywords: '极简、商务、低饱和、中性色、皮鞋/乐福鞋' },
  { scene: '日常休闲', formality: '3-5', keywords: '舒适、休闲、牛仔、运动鞋、颜色可更轻松' },
  { scene: '社交约会', formality: '5-6', keywords: '精致、法式/甜美/复古，保留一个视觉重点' },
  { scene: '正式场合', formality: '8-10', keywords: '套装、衬衫、西装外套，减少夸张图案' },
  { scene: '运动户外', formality: '2-4', keywords: '活动性、透气、防风防水，鞋履功能优先' },
  { scene: '季节节日', formality: '4-7', keywords: '氛围色、配饰点缀，但主色不超过 4 个' },
]

const scoreParts = [
  { name: '颜色协调', score: 30, detail: '主色控制在 2-4 个；中性色可做缓冲；高饱和色最多 1-2 个。' },
  { name: '风格统一', score: 25, detail: '一套穿搭保留 1 个主风格，最多 1 个辅助风格，避免正式+运动硬冲突。' },
  { name: '天气适配', score: 20, detail: '按温度、湿度、雨雪、大风、紫外线修正保暖指数和面料。' },
  { name: '场景适配', score: 15, detail: '用场景标签和正式度判断是否适合办公、约会、户外等场合。' },
  { name: '层次完整', score: 10, detail: '上装/下装或连衣裙完整，鞋履必备，外套和包饰按需要加分。' },
]

export function StandardsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-brand-500" />
          衣服穿搭标准
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          把“好看、合适、准确”拆成可量化字段，上传识别和智能推荐都按同一套标准判断。
        </p>
      </div>

      <section className="grid md:grid-cols-5 gap-3">
        {scoreParts.map((part) => (
          <div key={part.name} className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-2xl font-bold text-brand-600">{part.score}</p>
            <h3 className="text-sm font-semibold text-gray-900 mt-1">{part.name}</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">{part.detail}</p>
          </div>
        ))}
      </section>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel icon={Shirt} title="单品识别标准">
          <StandardLine label="基础字段" text="品类、子类、主色/辅色、面料、图案、季节、版型、状态。" />
          <StandardLine label="增强字段" text="保暖指数 1-10、厚度 1-5、正式度 1-10、风格标签最多 3 个、场景标签多个。" />
          <StandardLine label="识别校准" text="AI 自动识别后允许人工微调；保存时系统补全保暖、正式度、颜色属性。" />
        </Panel>

        <Panel icon={Palette} title="颜色标准">
          <StandardLine label="主色数量" text="1-2 个最稳，3-4 个可接受，超过 4 个会降低颜色分。" />
          <StandardLine label="中性色" text="黑、白、灰、米、棕可作为过渡色，提高兼容度。" />
          <StandardLine label="视觉重量" text="深色/厚重面料不宜堆太多，浅色或配饰可平衡比例。" />
        </Panel>

        <Panel icon={CloudSun} title="天气标准">
          <div className="space-y-3">
            {weatherRows.map((row) => {
              const range = getRecommendedWarmRange(row.temp)
              return (
                <div key={row.label} className="rounded-xl bg-gray-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-800">{row.label}</p>
                    <span className="text-xs text-brand-600 bg-brand-50 px-2 py-1 rounded-lg">
                      {range[0]}-{range[1]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{row.advice}</p>
                </div>
              )
            })}
          </div>
        </Panel>

        <Panel icon={SlidersHorizontal} title="场景标准">
          <div className="space-y-2">
            {sceneRows.map((row) => (
              <div key={row.scene} className="grid grid-cols-[82px_54px_1fr] gap-2 text-xs items-start">
                <span className="font-semibold text-gray-800">{row.scene}</span>
                <span className="text-brand-600">正式 {row.formality}</span>
                <span className="text-gray-500 leading-relaxed">{row.keywords}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <section className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Layers3 className="w-4 h-4 text-brand-500" />
          推荐排序权重
        </h3>
        <div className="grid sm:grid-cols-5 gap-3">
          {Object.entries(RECOMMEND_WEIGHTS).map(([key, value]) => (
            <div key={key} className="rounded-xl bg-gray-50 p-3">
              <p className="text-lg font-bold text-gray-900">{Math.round(value * 100)}%</p>
              <p className="text-xs text-gray-500 mt-1">{weightLabel(key)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">正式度参考</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {Object.entries(FORMALITY_LABELS).map(([level, label]) => (
            <div key={level} className="rounded-lg border border-gray-100 px-3 py-2 text-sm">
              <span className="font-semibold text-brand-600">{level}</span>
              <span className="text-gray-600 ml-2">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">标准风格库</h3>
        <div className="flex flex-wrap gap-2">
          {STANDARD_STYLES.map((style) => (
            <span key={style} className="px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 text-sm">
              {style}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}

function Panel({ icon: Icon, title, children }: { icon: typeof Shirt; title: string; children: ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-brand-500" />
        {title}
      </h3>
      {children}
    </section>
  )
}

function StandardLine({ label, text }: { label: string; text: string }) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="text-sm font-semibold text-gray-800">{label}</p>
      <p className="text-sm text-gray-500 mt-1 leading-relaxed">{text}</p>
    </div>
  )
}

function weightLabel(key: string) {
  const labels: Record<string, string> = {
    outfitMatch: '整体搭配分',
    weatherFit: '天气适配',
    sceneFit: '场景适配',
    userPreference: '个人偏好',
    wearBalance: '衣物轮换',
  }
  return labels[key] ?? key
}

import type { ReactNode } from 'react'
import { Shirt, Sparkles, CloudSun, MapPin, Palette, Home, ClipboardCheck, CalendarDays } from 'lucide-react'

export type TabId = 'home' | 'wardrobe' | 'match' | 'weather' | 'scene' | 'canvas' | 'standards' | 'logs'

interface LayoutProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  children: ReactNode
}

const NAV_ITEMS: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: 'home', label: '首页', icon: Home },
  { id: 'wardrobe', label: '我的衣橱', icon: Shirt },
  { id: 'match', label: '智能搭配', icon: Sparkles },
  { id: 'weather', label: '天气穿搭', icon: CloudSun },
  { id: 'scene', label: '场景穿搭', icon: MapPin },
  { id: 'canvas', label: 'DIY画布', icon: Palette },
  { id: 'standards', label: '穿搭标准', icon: ClipboardCheck },
  { id: 'logs', label: '穿搭日志', icon: CalendarDays },
]

export function Layout({ activeTab, onTabChange, children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass sticky top-0 z-50 border-b border-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md">
              <Shirt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">智能衣橱</h1>
              <p className="text-xs text-gray-500 hidden sm:block">AI 穿搭 · 云端管理</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 bg-white/60 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            本地同步
          </div>
        </div>
      </header>

      <nav className="glass border-b border-white/30 sticky top-[60px] z-40">
        <div className="max-w-7xl mx-auto px-2 sm:px-6">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-none">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === id
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                    : 'text-gray-600 hover:bg-white/70 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>

      <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-200/50">
        智能衣橱 · 衣物数字化管理 · 数据保存在本地浏览器
      </footer>
    </div>
  )
}

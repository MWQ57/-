import { useState, useEffect } from 'react'
import { Layout, type TabId } from './components/Layout'
import { UploadModal } from './components/UploadModal'
import { useWardrobeStore } from './store/wardrobeStore'
import { HomePage } from './pages/HomePage'
import { WardrobePage } from './pages/WardrobePage'
import { MatchPage } from './pages/MatchPage'
import { WeatherPage } from './pages/WeatherPage'
import { ScenePage } from './pages/ScenePage'
import { CanvasPage } from './pages/CanvasPage'
import { StandardsPage } from './pages/StandardsPage'
import { LogsPage } from './pages/LogsPage'

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const [uploadOpen, setUploadOpen] = useState(false)
  const init = useWardrobeStore((s) => s.init)

  useEffect(() => { init() }, [init])

  const renderPage = () => {
    switch (activeTab) {
      case 'home': return <HomePage onNavigate={setActiveTab} onUpload={() => setUploadOpen(true)} />
      case 'wardrobe': return <WardrobePage onUpload={() => setUploadOpen(true)} />
      case 'match': return <MatchPage />
      case 'weather': return <WeatherPage />
      case 'scene': return <ScenePage />
      case 'canvas': return <CanvasPage />
      case 'standards': return <StandardsPage />
      case 'logs': return <LogsPage onUpload={() => setUploadOpen(true)} />
    }
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderPage()}
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </Layout>
  )
}

export default App

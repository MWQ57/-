import { useState, useRef, useEffect } from 'react'
import { MapPin, Search, Navigation, X } from 'lucide-react'
import { searchCities, getLocation, POPULAR_CITIES, type LocationInfo } from '../services/weatherService'
import { saveLocation } from '../services/storage'

interface LocationPickerProps {
  current: LocationInfo | null
  onSelect: (loc: LocationInfo) => void
}

export function LocationPicker({ current, onSelect }: LocationPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<LocationInfo[]>([])
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    if (!open) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) { setResults([]); return }

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const cities = await searchCities(query)
        setResults(cities)
      } catch { setResults([]) }
      finally { setSearching(false) }
    }, 350)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, open])

  const handleSelect = (loc: LocationInfo) => {
    saveLocation(loc)
    onSelect(loc)
    setOpen(false)
    setQuery('')
    setResults([])
  }

  const handleGPS = async () => {
    const loc = await getLocation()
    saveLocation(loc)
    onSelect(loc)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm backdrop-blur-sm transition-colors"
      >
        <MapPin className="w-4 h-4" />
        {current?.city ?? '选择城市'}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in">
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="搜索城市..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                  autoFocus
                />
                {query && (
                  <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={handleGPS}
                className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-brand-600 hover:bg-brand-50 transition-colors"
              >
                <Navigation className="w-4 h-4" />
                使用当前定位
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {searching && <p className="text-xs text-gray-400 text-center py-4">搜索中...</p>}

              {results.length > 0 && results.map((loc, i) => (
                <button
                  key={`${loc.lat}-${loc.lon}-${i}`}
                  onClick={() => handleSelect(loc)}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                >
                  {loc.city}
                </button>
              ))}

              {!query && (
                <div className="p-2">
                  <p className="text-xs text-gray-400 px-2 py-1">热门城市</p>
                  <div className="grid grid-cols-3 gap-1">
                    {POPULAR_CITIES.map((loc) => (
                      <button
                        key={loc.city}
                        onClick={() => handleSelect(loc)}
                        className={`px-2 py-1.5 rounded-lg text-xs transition-colors ${
                          current?.city === loc.city
                            ? 'bg-brand-100 text-brand-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {loc.city}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {query && !searching && results.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">未找到相关城市</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

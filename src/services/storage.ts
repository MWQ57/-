import type { ClothingItem, Outfit, SavedCanvas, OutfitLog } from '../types'
import { normalizeAllItems } from '../services/itemStandards'

const KEYS = {
  clothing: 'smart-wardrobe-clothing',
  outfits: 'smart-wardrobe-outfits',
  canvases: 'smart-wardrobe-canvases',
  logs: 'smart-wardrobe-outfit-logs',
  location: 'smart-wardrobe-location',
}

export function loadClothing(): ClothingItem[] {
  try {
    const data = localStorage.getItem(KEYS.clothing)
    const items: ClothingItem[] = data ? JSON.parse(data) : []
    return normalizeAllItems(items)
  } catch {
    return []
  }
}

export function saveClothing(items: ClothingItem[]) {
  localStorage.setItem(KEYS.clothing, JSON.stringify(items))
}

export function loadOutfits(): Outfit[] {
  try {
    const data = localStorage.getItem(KEYS.outfits)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveOutfits(outfits: Outfit[]) {
  localStorage.setItem(KEYS.outfits, JSON.stringify(outfits))
}

export function loadCanvases(): SavedCanvas[] {
  try {
    const data = localStorage.getItem(KEYS.canvases)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveCanvases(canvases: SavedCanvas[]) {
  localStorage.setItem(KEYS.canvases, JSON.stringify(canvases))
}

export function loadOutfitLogs(): OutfitLog[] {
  try {
    const data = localStorage.getItem(KEYS.logs)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveOutfitLogs(logs: OutfitLog[]) {
  localStorage.setItem(KEYS.logs, JSON.stringify(logs))
}

export function loadLocation(): { lat: number; lon: number; city: string } | null {
  try {
    const data = localStorage.getItem(KEYS.location)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export function saveLocation(loc: { lat: number; lon: number; city: string }) {
  localStorage.setItem(KEYS.location, JSON.stringify(loc))
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

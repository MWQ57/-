import { create } from 'zustand'

import { v4 as uuidv4 } from 'uuid'

import type { ClothingItem, Outfit, SavedCanvas, CanvasItem, OutfitLog, OutfitLogSource, WeatherInfo, SceneType, OutfitScore } from '../types'

import * as storage from '../services/storage'

import { scoreOutfit } from '../services/scoringEngine'



interface WardrobeState {

  items: ClothingItem[]

  outfits: Outfit[]

  canvases: SavedCanvas[]

  logs: OutfitLog[]

  initialized: boolean



  init: () => void

  addItem: (item: Omit<ClothingItem, 'id' | 'createdAt' | 'updatedAt'>) => ClothingItem

  updateItem: (id: string, updates: Partial<ClothingItem>) => void

  deleteItem: (id: string) => void

  addOutfit: (name: string, itemIds: string[], scene?: string) => void

  deleteOutfit: (id: string) => void

  saveCanvas: (name: string, items: CanvasItem[]) => void

  deleteCanvas: (id: string) => void

  logOutfit: (params: {

    itemIds: string[]

    wornAt?: string
    photoUrl?: string

    scene?: SceneType

    weather?: WeatherInfo

    note?: string

    rating?: 1 | 2 | 3 | 4 | 5

    source: OutfitLogSource

    score?: OutfitScore

  }) => OutfitLog

  deleteLog: (id: string) => void

  getLogsByDate: (date: string) => OutfitLog[]

}



export const useWardrobeStore = create<WardrobeState>((set, get) => ({

  items: [],

  outfits: [],

  canvases: [],

  logs: [],

  initialized: false,



  init: () => {

    if (get().initialized) return

    set({

      items: storage.loadClothing(),

      outfits: storage.loadOutfits(),

      canvases: storage.loadCanvases(),

      logs: storage.loadOutfitLogs(),

      initialized: true,

    })

  },



  addItem: (data) => {

    const now = new Date().toISOString()

    const item: ClothingItem = { ...data, id: uuidv4(), createdAt: now, updatedAt: now }

    const items = [...get().items, item]

    storage.saveClothing(items)

    set({ items })

    return item

  },



  updateItem: (id, updates) => {

    const items = get().items.map((i) =>

      i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i

    )

    storage.saveClothing(items)

    set({ items })

  },



  deleteItem: (id) => {

    const items = get().items.filter((i) => i.id !== id)

    storage.saveClothing(items)

    set({ items })

  },



  addOutfit: (name, itemIds, scene) => {

    const outfit: Outfit = {

      id: uuidv4(),

      name,

      items: itemIds,

      scene: scene as Outfit['scene'],

      createdAt: new Date().toISOString(),

    }

    const outfits = [...get().outfits, outfit]

    storage.saveOutfits(outfits)

    set({ outfits })

  },



  deleteOutfit: (id) => {

    const outfits = get().outfits.filter((o) => o.id !== id)

    storage.saveOutfits(outfits)

    set({ outfits })

  },



  saveCanvas: (name, items) => {

    const canvas: SavedCanvas = { id: uuidv4(), name, items, createdAt: new Date().toISOString() }

    const canvases = [...get().canvases, canvas]

    storage.saveCanvases(canvases)

    set({ canvases })

  },



  deleteCanvas: (id) => {

    const canvases = get().canvases.filter((c) => c.id !== id)

    storage.saveCanvases(canvases)

    set({ canvases })

  },



  logOutfit: (params) => {

    const wornAt = params.wornAt ?? new Date().toISOString().slice(0, 10)

    const outfitItems = get().items.filter((i) => params.itemIds.includes(i.id))

    const score = params.score ?? scoreOutfit(outfitItems, {

      weather: params.weather,

      scene: params.scene,

    })



    const log: OutfitLog = {

      id: uuidv4(),

      itemIds: params.itemIds,

      wornAt,
      photoUrl: params.photoUrl,

      scene: params.scene,

      weather: params.weather,

      note: params.note,

      rating: params.rating,

      source: params.source,

      score,

      createdAt: new Date().toISOString(),

    }



    const logs = [log, ...get().logs]

    storage.saveOutfitLogs(logs)



    const items = get().items.map((i) => {

      if (!params.itemIds.includes(i.id)) return i

      return {

        ...i,

        wearCount: (i.wearCount ?? 0) + 1,

        lastWornAt: wornAt,

        updatedAt: new Date().toISOString(),

      }

    })

    storage.saveClothing(items)



    set({ logs, items })

    return log

  },



  deleteLog: (id) => {

    const logs = get().logs.filter((l) => l.id !== id)

    storage.saveOutfitLogs(logs)

    set({ logs })

  },



  getLogsByDate: (date) => get().logs.filter((l) => l.wornAt === date),

}))



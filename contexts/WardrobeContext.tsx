'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ClothingItem, Tag, Outfit, WardrobeStats } from '@/types/wardrobe'
import { 
  getClothingItems, 
  addClothingItem, 
  updateClothingItem, 
  deleteClothingItem,
  getTags,
  addTag,
  getOutfits,
  addOutfit,
  getWardrobeStats
} from '@/lib/database'

interface WardrobeContextType {
  // State
  items: ClothingItem[]
  tags: Tag[]
  outfits: Outfit[]
  stats: WardrobeStats | null
  loading: boolean
  error: string | null

  // Actions
  refreshItems: () => Promise<void>
  refreshTags: () => Promise<void>
  refreshOutfits: () => Promise<void>
  refreshStats: () => Promise<void>
  refreshAll: () => Promise<void>
  
  addItem: (itemData: Omit<ClothingItem, 'id' | 'createdAt' | 'updatedAt' | 'wearCount'>) => Promise<ClothingItem | null>
  updateItem: (id: string, updates: Partial<ClothingItem>) => Promise<ClothingItem | null>
  deleteItem: (id: string) => Promise<boolean>
  
  addNewTag: (tagData: Omit<Tag, 'id' | 'createdAt' | 'usageCount'>) => Promise<Tag | null>
  
  addNewOutfit: (outfitData: Omit<Outfit, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Outfit | null>
}

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined)

export const useWardrobe = () => {
  const context = useContext(WardrobeContext)
  if (context === undefined) {
    throw new Error('useWardrobe must be used within a WardrobeProvider')
  }
  return context
}

interface WardrobeProviderProps {
  children: ReactNode
}

export const WardrobeProvider: React.FC<WardrobeProviderProps> = ({ children }) => {
  const [items, setItems] = useState<ClothingItem[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [stats, setStats] = useState<WardrobeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Refresh functions
  const refreshItems = async () => {
    try {
      setError(null)
      const data = await getClothingItems()
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch items')
      console.error('Error refreshing items:', err)
    }
  }

  const refreshTags = async () => {
    try {
      setError(null)
      const data = await getTags()
      setTags(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tags')
      console.error('Error refreshing tags:', err)
    }
  }

  const refreshOutfits = async () => {
    try {
      setError(null)
      const data = await getOutfits()
      setOutfits(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch outfits')
      console.error('Error refreshing outfits:', err)
    }
  }

  const refreshStats = async () => {
    try {
      setError(null)
      const data = await getWardrobeStats()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats')
      console.error('Error refreshing stats:', err)
    }
  }

  const refreshAll = async () => {
    setLoading(true)
    try {
      await Promise.all([
        refreshItems(),
        refreshTags(),
        refreshOutfits(),
        refreshStats()
      ])
    } finally {
      setLoading(false)
    }
  }

  // Item actions
  const addItem = async (itemData: Omit<ClothingItem, 'id' | 'createdAt' | 'updatedAt' | 'wearCount'>) => {
    try {
      console.log('WardrobeContext addItem called with:', itemData)
      setError(null)
      const newItem = await addClothingItem(itemData)
      console.log('addClothingItem returned:', newItem)
      if (newItem) {
        setItems(prev => [newItem, ...prev])
        await refreshStats() // Update stats after adding item
        await refreshTags() // Refresh tags in case new ones were created
        console.log('Item added successfully to context')
      } else {
        console.log('addClothingItem returned null - check database logs for details')
        setError('Failed to add item to database. Check console for details.')
      }
      return newItem
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item'
      setError(errorMessage)
      console.error('Error adding item:', err)
      return null
    }
  }

  const updateItem = async (id: string, updates: Partial<ClothingItem>) => {
    try {
      setError(null)
      const updatedItem = await updateClothingItem(id, updates)
      if (updatedItem) {
        setItems(prev => prev.map(item => item.id === id ? updatedItem : item))
        await refreshStats() // Update stats after updating item
        await refreshTags() // Refresh tags in case they changed
      }
      return updatedItem
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item')
      console.error('Error updating item:', err)
      return null
    }
  }

  const deleteItem = async (id: string) => {
    try {
      setError(null)
      const success = await deleteClothingItem(id)
      if (success) {
        setItems(prev => prev.filter(item => item.id !== id))
        await refreshStats() // Update stats after deleting item
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item')
      console.error('Error deleting item:', err)
      return false
    }
  }

  // Tag actions
  const addNewTag = async (tagData: Omit<Tag, 'id' | 'createdAt' | 'usageCount'>) => {
    try {
      setError(null)
      const newTag = await addTag(tagData)
      if (newTag) {
        setTags(prev => [newTag, ...prev])
      }
      return newTag
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add tag')
      console.error('Error adding tag:', err)
      return null
    }
  }

  // Outfit actions
  const addNewOutfit = async (outfitData: Omit<Outfit, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null)
      const newOutfit = await addOutfit(outfitData)
      if (newOutfit) {
        setOutfits(prev => [newOutfit, ...prev])
        await refreshTags() // Refresh tags in case new ones were created
      }
      return newOutfit
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add outfit')
      console.error('Error adding outfit:', err)
      return null
    }
  }

  // Initialize data on mount
  useEffect(() => {
    refreshAll()
  }, [])

  const value: WardrobeContextType = {
    // State
    items,
    tags,
    outfits,
    stats,
    loading,
    error,

    // Actions
    refreshItems,
    refreshTags,
    refreshOutfits,
    refreshStats,
    refreshAll,
    
    addItem,
    updateItem,
    deleteItem,
    
    addNewTag,
    
    addNewOutfit
  }

  return (
    <WardrobeContext.Provider value={value}>
      {children}
    </WardrobeContext.Provider>
  )
}



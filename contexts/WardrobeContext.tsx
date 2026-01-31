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
  updateOutfit,
  deleteOutfit,
  getWardrobeStats
} from '@/lib/database'
import { useAuth } from './AuthContext'

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
  updateOutfit: (id: string, updates: Partial<Outfit>) => Promise<Outfit | null>
  deleteOutfit: (id: string) => Promise<boolean>
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
  const { user, loading: authLoading } = useAuth()
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
      setError(null)
      const newItem = await addClothingItem(itemData)
      if (newItem) {
        setItems(prev => [newItem, ...prev])
        await refreshStats()
        await refreshTags()
      } else {
        setError('Failed to add item to database.')
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

        // Clean up outfits that contain this item
        // If an outfit has no remaining items after removal, delete it
        const outfitsToCheck = outfits.filter(outfit => outfit.items.includes(id))
        for (const outfit of outfitsToCheck) {
          const remainingItems = outfit.items.filter(itemId => itemId !== id)
          if (remainingItems.length === 0) {
            // Delete outfit with no items
            await deleteOutfit(outfit.id)
            setOutfits(prev => prev.filter(o => o.id !== outfit.id))
          } else {
            // Update outfit to remove the deleted item
            await updateOutfit(outfit.id, { items: remainingItems })
            setOutfits(prev => prev.map(o =>
              o.id === outfit.id ? { ...o, items: remainingItems } : o
            ))
          }
        }

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

  const updateOutfitAction = async (id: string, updates: Partial<Outfit>) => {
    try {
      setError(null)
      const updatedOutfit = await updateOutfit(id, updates)
      if (updatedOutfit) {
        setOutfits(prev => prev.map(outfit => outfit.id === id ? updatedOutfit : outfit))
      }
      return updatedOutfit
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update outfit')
      console.error('Error updating outfit:', err)
      return null
    }
  }

  const deleteOutfitAction = async (id: string) => {
    try {
      setError(null)
      const success = await deleteOutfit(id)
      if (success) {
        setOutfits(prev => prev.filter(outfit => outfit.id !== id))
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete outfit')
      console.error('Error deleting outfit:', err)
      return false
    }
  }

  // Initialize data when user is authenticated
  useEffect(() => {
    if (authLoading) {
      return // Wait for auth to complete
    }

    if (user) {
      refreshAll()
    } else {
      // Clear data when logged out
      setItems([])
      setTags([])
      setOutfits([])
      setStats(null)
      setLoading(false)
    }
  }, [user, authLoading])

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

    addNewOutfit,
    updateOutfit: updateOutfitAction,
    deleteOutfit: deleteOutfitAction
  }

  return (
    <WardrobeContext.Provider value={value}>
      {children}
    </WardrobeContext.Provider>
  )
}



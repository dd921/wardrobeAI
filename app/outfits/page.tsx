'use client'

import { useState, useCallback } from 'react'
import Navigation from '@/components/Navigation'
import OutfitCard from '@/components/OutfitCard'
import CreateOutfitModal from '@/components/CreateOutfitModal'
import OutfitSuggestions from '@/components/OutfitSuggestions'
import { useWardrobe } from '@/contexts/WardrobeContext'
import { Plus, Search, Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import { ClothingItem } from '@/types/wardrobe'

interface OutfitSuggestion {
  id: string
  name: string
  items: ClothingItem[]
  reason: string
}

export default function OutfitsPage() {
  const { outfits, items, addNewOutfit, updateOutfit, deleteOutfit, loading } = useWardrobe()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [suggestedItems, setSuggestedItems] = useState<ClothingItem[] | undefined>()
  const [suggestedName, setSuggestedName] = useState<string | undefined>()
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCreateOutfit = async (outfitData: {
    name: string
    description?: string
    items: string[]
    tags: string[]
    isFavorite: boolean
  }) => {
    const result = await addNewOutfit(outfitData)
    if (result) {
      toast.success('Outfit created!')
      setShowCreateModal(false)
      setSuggestedItems(undefined)
      setSuggestedName(undefined)
    } else {
      toast.error('Failed to create outfit')
    }
  }

  const handleSelectSuggestion = (suggestion: OutfitSuggestion) => {
    setSuggestedItems(suggestion.items)
    setSuggestedName(suggestion.name)
    setShowCreateModal(true)
  }

  const handleToggleFavorite = async (outfitId: string) => {
    const outfit = outfits.find(o => o.id === outfitId)
    if (!outfit) return

    const result = await updateOutfit(outfitId, { isFavorite: !outfit.isFavorite })
    if (result) {
      toast.success(result.isFavorite ? 'Added to favorites' : 'Removed from favorites')
    } else {
      toast.error('Failed to update favorite')
    }
  }

  const handleDeleteOutfit = async (outfitId: string) => {
    if (confirm('Are you sure you want to delete this outfit?')) {
      const success = await deleteOutfit(outfitId)
      if (success) {
        toast.success('Outfit deleted')
      } else {
        toast.error('Failed to delete outfit')
      }
    }
  }

  const handleRefreshSuggestions = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  // Filter outfits
  const filteredOutfits = outfits.filter(outfit => {
    if (showFavoritesOnly && !outfit.isFavorite) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        outfit.name.toLowerCase().includes(query) ||
        outfit.description?.toLowerCase().includes(query) ||
        outfit.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-900 dark:to-gray-950">
      <Navigation />

      <div className="lg:pl-64">
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Outfits</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400 leading-relaxed">
                Create and manage your favorite outfit combinations.
              </p>
            </div>
            <button
              onClick={() => {
                setSuggestedItems(undefined)
                setSuggestedName(undefined)
                setShowCreateModal(true)
              }}
              className="mt-4 sm:mt-0 btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Outfit
            </button>
          </div>

          {/* Outfit Suggestions */}
          <div className="mb-8">
            <OutfitSuggestions
              key={refreshKey}
              items={items}
              onSelectSuggestion={handleSelectSuggestion}
              onRefresh={handleRefreshSuggestions}
            />
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search outfits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 shadow-inner-soft focus:ring-2 focus:ring-wardrobe-500/20 focus:border-wardrobe-500 focus:bg-white dark:focus:bg-gray-700 transition-all duration-200"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-soft">
              <input
                type="checkbox"
                checked={showFavoritesOnly}
                onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                className="h-4 w-4 text-wardrobe-600 focus:ring-wardrobe-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <Heart className={`h-4 w-4 ${showFavoritesOnly ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
              <span className="text-sm text-gray-700 dark:text-gray-300">Favorites only</span>
            </label>
          </div>

          {/* Outfits Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-soft overflow-hidden">
                  <div className="aspect-square shimmer-loading" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 shimmer-loading rounded-lg w-3/4" />
                    <div className="h-3 shimmer-loading rounded-lg w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredOutfits.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredOutfits.map(outfit => (
                <OutfitCard
                  key={outfit.id}
                  outfit={outfit}
                  items={items}
                  onToggleFavorite={handleToggleFavorite}
                  onDelete={handleDeleteOutfit}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-soft">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {outfits.length === 0 ? 'No outfits yet' : 'No matching outfits'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {outfits.length === 0
                  ? 'Create your first outfit by combining items from your wardrobe.'
                  : 'Try adjusting your search or filters.'}
              </p>
              {outfits.length === 0 && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary"
                >
                  Create Your First Outfit
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Outfit Modal */}
      {showCreateModal && (
        <CreateOutfitModal
          items={items}
          onClose={() => {
            setShowCreateModal(false)
            setSuggestedItems(undefined)
            setSuggestedName(undefined)
          }}
          onSave={handleCreateOutfit}
          suggestedItems={suggestedItems}
          suggestedName={suggestedName}
        />
      )}
    </div>
  )
}

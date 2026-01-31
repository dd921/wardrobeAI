'use client'

import { useState, useMemo } from 'react'
import Navigation from '@/components/Navigation'
import { useWardrobe } from '@/contexts/WardrobeContext'
import { Search, X, Filter, Heart, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { ClothingCategory } from '@/types/wardrobe'

const CATEGORIES: ClothingCategory[] = [
  'Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories',
  'Undergarments', 'Sleepwear', 'Activewear', 'Formal Wear',
  'Swimwear', 'Loungewear', 'Other'
]

export default function SearchPage() {
  const { items, loading } = useWardrobe()

  const [query, setQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<ClothingCategory[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Get unique colors from items
  const availableColors = useMemo(() => {
    const colors = new Set<string>()
    items.forEach(item => {
      if (item.color) colors.add(item.color)
    })
    return Array.from(colors).sort()
  }, [items])

  // Filter items based on search criteria
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Text search
      if (query) {
        const searchLower = query.toLowerCase()
        const matchesText =
          item.name.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower) ||
          item.brand?.toLowerCase().includes(searchLower) ||
          item.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
          item.color?.toLowerCase().includes(searchLower) ||
          item.material?.toLowerCase().includes(searchLower)
        if (!matchesText) return false
      }

      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(item.category)) {
        return false
      }

      // Color filter
      if (selectedColors.length > 0 && (!item.color || !selectedColors.includes(item.color))) {
        return false
      }

      // Favorites filter
      if (favoritesOnly && !item.isFavorite) {
        return false
      }

      return true
    })
  }, [items, query, selectedCategories, selectedColors, favoritesOnly])

  const toggleCategory = (category: ClothingCategory) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const toggleColor = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    )
  }

  const clearFilters = () => {
    setQuery('')
    setSelectedCategories([])
    setSelectedColors([])
    setFavoritesOnly(false)
  }

  const hasActiveFilters = query || selectedCategories.length > 0 || selectedColors.length > 0 || favoritesOnly

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="lg:pl-64">
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Search Wardrobe</h1>
            <p className="mt-2 text-gray-600">
              Find items in your wardrobe by name, color, category, or tags.
            </p>
          </div>

          {/* Search Bar */}
          <div className="card mb-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, brand, color, material, or tags..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wardrobe-500 text-lg"
                  autoFocus
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  showFilters || hasActiveFilters
                    ? 'bg-wardrobe-50 border-wardrobe-300 text-wardrobe-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="h-5 w-5" />
                Filters
                {hasActiveFilters && (
                  <span className="bg-wardrobe-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {(selectedCategories.length + selectedColors.length + (favoritesOnly ? 1 : 0))}
                  </span>
                )}
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t space-y-4">
                {/* Categories */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(category => (
                      <button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedCategories.includes(category)
                            ? 'bg-wardrobe-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                {availableColors.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Colors</h3>
                    <div className="flex flex-wrap gap-2">
                      {availableColors.map(color => (
                        <button
                          key={color}
                          onClick={() => toggleColor(color)}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            selectedColors.includes(color)
                              ? 'bg-wardrobe-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Filters */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={favoritesOnly}
                      onChange={(e) => setFavoritesOnly(e.target.checked)}
                      className="h-4 w-4 text-wardrobe-600 focus:ring-wardrobe-500 border-gray-300 rounded"
                    />
                    <Heart className={`h-4 w-4 ${favoritesOnly ? 'text-red-500' : 'text-gray-400'}`} />
                    <span className="text-sm text-gray-700">Favorites only</span>
                  </label>

                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-wardrobe-600 hover:text-wardrobe-700"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="mb-4 text-sm text-gray-500">
            {loading ? 'Loading...' : `${filteredItems.length} item${filteredItems.length !== 1 ? 's' : ''} found`}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredItems.map(item => (
                <Link
                  key={item.id}
                  href={`/wardrobe/${item.id}`}
                  className="bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
                >
                  {item.images[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full aspect-square object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No image</span>
                    </div>
                  )}
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.category}</p>
                      </div>
                      {item.isFavorite && (
                        <Heart className="h-4 w-4 text-red-500 flex-shrink-0" fill="currentColor" />
                      )}
                    </div>
                    {item.color && (
                      <p className="text-xs text-gray-400 mt-1">{item.color}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border">
              <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-500 mb-4">
                {hasActiveFilters
                  ? 'Try adjusting your search or filters.'
                  : 'Start typing to search your wardrobe.'}
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn-secondary">
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

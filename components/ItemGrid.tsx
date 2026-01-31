'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Heart, MoreVertical, Eye, Edit, Trash2, Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { ClothingItem, ClothingCategory } from '@/types/wardrobe'
import { formatPrice, formatRelativeDate } from '@/lib/utils'
import { useWardrobe } from '@/contexts/WardrobeContext'
import toast from 'react-hot-toast'

const categories: ClothingCategory[] = [
  'Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories',
  'Undergarments', 'Sleepwear', 'Activewear', 'Formal Wear',
  'Swimwear', 'Loungewear', 'Other'
]

type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'price-high' | 'price-low' | 'most-worn' | 'least-worn'

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'price-high', label: 'Price (High to Low)' },
  { value: 'price-low', label: 'Price (Low to High)' },
  { value: 'most-worn', label: 'Most Worn' },
  { value: 'least-worn', label: 'Least Worn' },
]

export default function ItemGrid() {
  const { items, updateItem, deleteItem, loading, error } = useWardrobe()
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory | 'all'>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showFilters, setShowFilters] = useState(false)

  // Get all unique tags from items
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    items.forEach(item => item.tags.forEach(tag => tagSet.add(tag)))
    return Array.from(tagSet).sort()
  }, [items])

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let result = [...items]

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.brand?.toLowerCase().includes(query) ||
        item.color?.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(item => item.category === selectedCategory)
    }

    // Tags filter
    if (selectedTags.length > 0) {
      result = result.filter(item =>
        selectedTags.every(tag => item.tags.includes(tag))
      )
    }

    // Favorites filter
    if (showFavoritesOnly) {
      result = result.filter(item => item.isFavorite)
    }

    // Sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'price-high':
        result.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case 'price-low':
        result.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case 'most-worn':
        result.sort((a, b) => b.wearCount - a.wearCount)
        break
      case 'least-worn':
        result.sort((a, b) => a.wearCount - b.wearCount)
        break
    }

    return result
  }, [items, searchQuery, selectedCategory, selectedTags, showFavoritesOnly, sortBy])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedTags([])
    setShowFavoritesOnly(false)
    setSortBy('newest')
  }

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedTags.length > 0 || showFavoritesOnly

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const toggleFavorite = async (itemId: string) => {
    const item = items.find(i => i.id === itemId)
    if (item) {
      const success = await updateItem(itemId, { isFavorite: !item.isFavorite })
      if (success) {
        toast.success(item.isFavorite ? 'Removed from favorites' : 'Added to favorites')
      } else {
        toast.error('Failed to update favorite status')
      }
    }
  }

  const handleDelete = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      const success = await deleteItem(itemId)
      if (success) {
        toast.success('Item deleted successfully')
      } else {
        toast.error('Failed to delete item')
      }
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-soft">
            <div className="aspect-[3/4] shimmer-loading"></div>
            <div className="p-4 space-y-2">
              <div className="h-4 shimmer-loading rounded-lg w-3/4"></div>
              <div className="h-3 shimmer-loading rounded-lg w-1/2"></div>
              <div className="h-3 shimmer-loading rounded-lg w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">Error loading items: {error}</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No items found</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">Start building your wardrobe by adding your first item.</p>
        <Link href="/add-item" className="btn-primary">
          Add Your First Item
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Search and Filter Bar */}
      <div className="mb-6 space-y-4">
        {/* Main Search Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, brand, color, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800 shadow-inner-soft focus:ring-2 focus:ring-wardrobe-500/20 focus:border-wardrobe-500 focus:bg-white dark:focus:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as ClothingCategory | 'all')}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-gray-100 shadow-soft focus:ring-2 focus:ring-wardrobe-500/20 focus:border-wardrobe-500 min-w-[150px] transition-all duration-200"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-gray-100 shadow-soft focus:ring-2 focus:ring-wardrobe-500/20 focus:border-wardrobe-500 min-w-[160px] transition-all duration-200"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 border rounded-xl flex items-center gap-2 transition-all duration-200 shadow-soft ${showFilters || hasActiveFilters
                ? 'border-wardrobe-500 bg-wardrobe-50 dark:bg-wardrobe-900/30 text-wardrobe-700 dark:text-wardrobe-400'
                : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="bg-wardrobe-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {(selectedCategory !== 'all' ? 1 : 0) + selectedTags.length + (showFavoritesOnly ? 1 : 0) + (searchQuery ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="p-4 bg-gray-50/80 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-inner-soft space-y-4">
            {/* Favorites Toggle */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showFavoritesOnly}
                  onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                  className="h-4 w-4 text-wardrobe-600 focus:ring-wardrobe-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show favorites only</span>
                <Heart className={`h-4 w-4 ${showFavoritesOnly ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
              </label>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-wardrobe-600 dark:text-wardrobe-400 hover:text-wardrobe-700 dark:hover:text-wardrobe-300 font-medium transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Tags */}
            {allTags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by tags</label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-all duration-200 ${selectedTags.includes(tag)
                          ? 'bg-wardrobe-600 text-white border-wardrobe-600 shadow-soft'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-soft'
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            Showing {filteredItems.length} of {items.length} item{items.length !== 1 ? 's' : ''}
          </span>
          {selectedTags.length > 0 && (
            <div className="flex items-center gap-2">
              <span>Tags:</span>
              {selectedTags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-wardrobe-100 dark:bg-wardrobe-900/30 text-wardrobe-700 dark:text-wardrobe-400 rounded-lg text-xs border border-wardrobe-200 dark:border-wardrobe-800"
                >
                  {tag}
                  <button onClick={() => toggleTag(tag)} className="hover:text-wardrobe-900 dark:hover:text-wardrobe-300 transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* No Results Message */}
      {filteredItems.length === 0 && items.length > 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <Search className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No matching items</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Try adjusting your search or filters.</p>
          <button onClick={clearFilters} className="btn-secondary">
            Clear Filters
          </button>
        </div>
      )}

      {/* Item Grid */}
      {filteredItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-200"
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Selection Checkbox */}
              <div className="absolute top-3 left-3 z-10">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleItemSelection(item.id)}
                  className="h-4 w-4 text-wardrobe-600 focus:ring-wardrobe-500 border-gray-300 rounded shadow-soft"
                />
              </div>

              {/* Favorite Button */}
              <button
                onClick={() => toggleFavorite(item.id)}
                className={`absolute top-3 right-3 z-10 p-1.5 rounded-xl backdrop-blur-sm shadow-soft transition-all duration-200 ${item.isFavorite
                    ? 'bg-red-500 text-white'
                    : 'bg-white/80 text-gray-400 hover:bg-red-500 hover:text-white'
                  }`}
              >
                <Heart className={`h-4 w-4 ${item.isFavorite ? 'fill-current' : ''}`} />
              </button>

              {/* Image */}
              <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent) {
                        parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><span class="text-4xl text-gray-400">👕</span></div>'
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl text-gray-400">👕</span>
                  </div>
                )}

                {/* Hover Overlay */}
                {hoveredItem === item.id && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex items-center justify-center space-x-2">
                    <Link
                      href={`/wardrobe/${item.id}`}
                      className="p-2.5 bg-white rounded-xl text-gray-900 hover:bg-gray-100 shadow-soft hover:scale-110 transition-all duration-200"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/wardrobe/${item.id}/edit`}
                      className="p-2.5 bg-white rounded-xl text-gray-900 hover:bg-gray-100 shadow-soft hover:scale-110 transition-all duration-200"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2.5 bg-red-500 rounded-xl text-white hover:bg-red-600 shadow-soft hover:scale-110 transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Item Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm leading-tight">
                    {item.name}
                  </h3>
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                  {item.description}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">
                    {item.category}
                  </span>
                  {item.price && (
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {formatPrice(item.price)}
                    </span>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-block px-2 py-1 text-xs bg-wardrobe-50 dark:bg-wardrobe-900/30 text-wardrobe-700 dark:text-wardrobe-400 rounded-lg border border-wardrobe-100 dark:border-wardrobe-800"
                    >
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 3 && (
                    <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg">
                      +{item.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Additional Info */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Worn {item.wearCount} times</span>
                  <span>{formatRelativeDate(item.lastWorn || item.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

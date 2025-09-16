'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react'
import { ClothingItem } from '@/types/wardrobe'
import { formatPrice, formatRelativeDate } from '@/lib/utils'
import { useWardrobe } from '@/contexts/WardrobeContext'
import toast from 'react-hot-toast'

export default function ItemGrid() {
  const { items, updateItem, deleteItem, loading, error } = useWardrobe()
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

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
          <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
            <div className="aspect-[3/4] bg-gray-200"></div>
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading items: {error}</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
        <p className="text-gray-500 mb-4">Start building your wardrobe by adding your first item.</p>
        <Link href="/add-item" className="btn-primary">
          Add Your First Item
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <div
          key={item.id}
          className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200"
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          {/* Selection Checkbox */}
          <div className="absolute top-3 left-3 z-10">
            <input
              type="checkbox"
              checked={selectedItems.includes(item.id)}
              onChange={() => toggleItemSelection(item.id)}
              className="h-4 w-4 text-wardrobe-600 focus:ring-wardrobe-500 border-gray-300 rounded"
            />
          </div>

          {/* Favorite Button */}
          <button
            onClick={() => toggleFavorite(item.id)}
            className={`absolute top-3 right-3 z-10 p-1 rounded-full transition-all duration-200 ${
              item.isFavorite 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 text-gray-400 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart className={`h-4 w-4 ${item.isFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* Image */}
          <div className="aspect-[3/4] bg-gray-200 relative overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl text-gray-400">👕</span>
            </div>
            
            {/* Hover Overlay */}
            {hoveredItem === item.id && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center space-x-2">
                <Link
                  href={`/wardrobe/${item.id}`}
                  className="p-2 bg-white rounded-full text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </Link>
                <Link
                  href={`/wardrobe/${item.id}/edit`}
                  className="p-2 bg-white rounded-full text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </Link>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Item Info */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-gray-900 text-sm leading-tight">
                {item.name}
              </h3>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mb-3 line-clamp-2">
              {item.description}
            </p>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                {item.category}
              </span>
              {item.price && (
                <span className="text-sm font-semibold text-gray-900">
                  {formatPrice(item.price)}
                </span>
              )}
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {item.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-2 py-1 text-xs bg-wardrobe-100 text-wardrobe-700 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {item.tags.length > 3 && (
                <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                  +{item.tags.length - 3}
                </span>
              )}
            </div>
            
            {/* Additional Info */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Worn {item.wearCount} times</span>
              <span>{formatRelativeDate(item.lastWorn || item.createdAt)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}


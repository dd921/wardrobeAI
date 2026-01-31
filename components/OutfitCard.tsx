'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, Trash2, Eye } from 'lucide-react'
import { Outfit, ClothingItem } from '@/types/wardrobe'
import { formatRelativeDate } from '@/lib/utils'

interface OutfitCardProps {
  outfit: Outfit
  items: ClothingItem[]
  onToggleFavorite: (id: string) => void
  onDelete: (id: string) => void
}

export default function OutfitCard({ outfit, items, onToggleFavorite, onDelete }: OutfitCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Get the actual clothing items for this outfit
  const outfitItems = outfit.items
    .map(itemId => items.find(item => item.id === itemId))
    .filter(Boolean) as ClothingItem[]

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Item Preview Grid */}
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 relative">
        <div className={`grid gap-1.5 p-2.5 h-full ${
          outfitItems.length === 1 ? 'grid-cols-1' :
          outfitItems.length === 2 ? 'grid-cols-2' :
          outfitItems.length <= 4 ? 'grid-cols-2' :
          'grid-cols-3'
        }`}>
          {outfitItems.slice(0, 6).map((item, index) => (
            <div key={item.id} className="bg-white dark:bg-gray-700 rounded-lg overflow-hidden shadow-inner-soft">
              {item.images && item.images.length > 0 ? (
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl bg-gray-50 dark:bg-gray-600">
                  👕
                </div>
              )}
            </div>
          ))}
          {outfitItems.length === 0 && (
            <div className="col-span-full flex items-center justify-center text-gray-400 dark:text-gray-500">
              No items
            </div>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => onToggleFavorite(outfit.id)}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-xl backdrop-blur-sm shadow-soft transition-all duration-200 ${
            outfit.isFavorite
              ? 'bg-red-500 text-white'
              : 'bg-white/80 text-gray-400 hover:bg-red-500 hover:text-white'
          }`}
        >
          <Heart className={`h-4 w-4 ${outfit.isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Hover Actions */}
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex items-center justify-center gap-2">
            <button
              onClick={() => onDelete(outfit.id)}
              className="p-2.5 bg-red-500 rounded-xl text-white hover:bg-red-600 shadow-soft hover:scale-110 transition-all duration-200"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Outfit Info */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{outfit.name}</h3>
        {outfit.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">{outfit.description}</p>
        )}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{outfitItems.length} items</span>
          <span>{formatRelativeDate(outfit.createdAt)}</span>
        </div>
        {outfit.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {outfit.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-wardrobe-50 dark:bg-wardrobe-900/30 text-wardrobe-700 dark:text-wardrobe-400 rounded-lg text-xs border border-wardrobe-100 dark:border-wardrobe-800">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

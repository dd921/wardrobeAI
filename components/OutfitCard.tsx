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
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Item Preview Grid */}
      <div className="aspect-square bg-gray-100 relative">
        <div className={`grid gap-1 p-2 h-full ${
          outfitItems.length === 1 ? 'grid-cols-1' :
          outfitItems.length === 2 ? 'grid-cols-2' :
          outfitItems.length <= 4 ? 'grid-cols-2' :
          'grid-cols-3'
        }`}>
          {outfitItems.slice(0, 6).map((item, index) => (
            <div key={item.id} className="bg-gray-200 rounded overflow-hidden">
              {item.images && item.images.length > 0 ? (
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  👕
                </div>
              )}
            </div>
          ))}
          {outfitItems.length === 0 && (
            <div className="col-span-full flex items-center justify-center text-gray-400">
              No items
            </div>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => onToggleFavorite(outfit.id)}
          className={`absolute top-2 right-2 p-1.5 rounded-full transition-all ${
            outfit.isFavorite
              ? 'bg-red-500 text-white'
              : 'bg-white/80 text-gray-400 hover:bg-red-500 hover:text-white'
          }`}
        >
          <Heart className={`h-4 w-4 ${outfit.isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Hover Actions */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2">
            <button
              onClick={() => onDelete(outfit.id)}
              className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Outfit Info */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 truncate">{outfit.name}</h3>
        {outfit.description && (
          <p className="text-sm text-gray-500 truncate mt-1">{outfit.description}</p>
        )}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>{outfitItems.length} items</span>
          <span>{formatRelativeDate(outfit.createdAt)}</span>
        </div>
        {outfit.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {outfit.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-wardrobe-100 text-wardrobe-700 rounded-full text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

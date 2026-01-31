'use client'

import { useState } from 'react'
import { X, Check, Plus } from 'lucide-react'
import { ClothingItem, ClothingCategory } from '@/types/wardrobe'

interface CreateOutfitModalProps {
  items: ClothingItem[]
  onClose: () => void
  onSave: (outfit: { name: string; description?: string; items: string[]; tags: string[]; isFavorite: boolean }) => void
  suggestedItems?: ClothingItem[]
  suggestedName?: string
}

const categoryOrder: ClothingCategory[] = ['Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories']

export default function CreateOutfitModal({ items, onClose, onSave, suggestedItems, suggestedName }: CreateOutfitModalProps) {
  const [name, setName] = useState(suggestedName || '')
  const [description, setDescription] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>(suggestedItems?.map(i => i.id) || [])
  const [tags, setTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')
  const [activeCategory, setActiveCategory] = useState<ClothingCategory | 'all'>('all')

  const toggleItem = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    )
  }

  const addTag = () => {
    if (customTag.trim() && !tags.includes(customTag.trim())) {
      setTags(prev => [...prev, customTag.trim()])
      setCustomTag('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag))
  }

  const handleSave = () => {
    if (!name.trim() || selectedItems.length === 0) return
    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      items: selectedItems,
      tags,
      isFavorite: false
    })
  }

  // Group items by category
  const itemsByCategory = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, ClothingItem[]>)

  const filteredItems = activeCategory === 'all' ? items : itemsByCategory[activeCategory] || []
  const categories = Object.keys(itemsByCategory) as ClothingCategory[]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Create Outfit</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex flex-col md:flex-row h-[calc(90vh-140px)]">
            {/* Left: Item Selection */}
            <div className="flex-1 overflow-y-auto p-4 border-r">
              <h3 className="font-medium text-gray-900 mb-3">Select Items</h3>

              {/* Category Tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-3 py-1 rounded-full text-sm ${
                    activeCategory === 'all'
                      ? 'bg-wardrobe-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      activeCategory === cat
                        ? 'bg-wardrobe-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {filteredItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedItems.includes(item.id)
                        ? 'border-wardrobe-600 ring-2 ring-wardrobe-200'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    {item.images && item.images.length > 0 ? (
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl">👕</div>
                    )}
                    {selectedItems.includes(item.id) && (
                      <div className="absolute top-1 right-1 bg-wardrobe-600 text-white rounded-full p-0.5">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                      {item.name}
                    </div>
                  </button>
                ))}
              </div>

              {filteredItems.length === 0 && (
                <p className="text-center text-gray-500 py-8">No items in this category</p>
              )}
            </div>

            {/* Right: Outfit Details */}
            <div className="w-full md:w-80 p-4 overflow-y-auto bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-3">Outfit Details</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Casual Friday"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-wardrobe-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description..."
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-wardrobe-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Add tag..."
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-wardrobe-500"
                    />
                    <button onClick={addTag} className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-wardrobe-100 text-wardrobe-700 rounded-full text-sm">
                          {tag}
                          <button onClick={() => removeTag(tag)}><X className="h-3 w-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Items Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selected ({selectedItems.length})
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {selectedItems.map(itemId => {
                      const item = items.find(i => i.id === itemId)
                      if (!item) return null
                      return (
                        <div key={itemId} className="aspect-square rounded overflow-hidden bg-gray-200">
                          {item.images?.[0] ? (
                            <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">👕</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 border-t bg-white">
            <button onClick={onClose} className="btn-secondary">Cancel</button>
            <button
              onClick={handleSave}
              disabled={!name.trim() || selectedItems.length === 0}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Outfit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import type { ImageGroup } from '@/lib/imageSimilarity'
import { COLOR_MAP } from '@/lib/imageSimilarity'
import { ClothingCategory } from '@/types/wardrobe'

// Map from classifier categories to wardrobe categories
const CATEGORY_MAP: Record<string, ClothingCategory> = {
  'Tops': 'Tops',
  'Bottoms': 'Bottoms',
  'Outerwear': 'Outerwear',
  'Dresses': 'Formal Wear',
  'Shoes': 'Shoes',
  'Accessories': 'Accessories',
  'Activewear': 'Activewear',
  'Swimwear': 'Swimwear',
  'Sleepwear': 'Sleepwear',
  'Other': 'Other',
}

interface ItemFormModalProps {
  groups: ImageGroup[]
  currentIndex: number
  onSave: (groupId: string, data: ItemFormData) => Promise<void>
  onSkip: (groupId: string) => void
  onClose: () => void
  onNavigate: (index: number) => void
  isSaving: boolean
}

export interface ItemFormData {
  name: string
  category: ClothingCategory
  color: string
  brand?: string
  size?: string
  tags: string[]
}

const categories: ClothingCategory[] = [
  'Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories',
  'Undergarments', 'Sleepwear', 'Activewear', 'Formal Wear',
  'Swimwear', 'Loungewear', 'Other'
]

const suggestedTags = [
  'Casual', 'Formal', 'Athletic', 'Vintage', 'Modern',
  'Summer', 'Winter', 'Spring', 'Fall',
  'Work', 'Party', 'Everyday', 'Special Occasion'
]

export default function ItemFormModal({
  groups,
  currentIndex,
  onSave,
  onSkip,
  onClose,
  onNavigate,
  isSaving
}: ItemFormModalProps) {
  const group = groups[currentIndex]

  // Get the detected category or default to 'Other'
  const getDetectedCategory = (g: ImageGroup): ClothingCategory => {
    if (g.detectedCategory && CATEGORY_MAP[g.detectedCategory]) {
      return CATEGORY_MAP[g.detectedCategory]
    }
    return 'Other'
  }

  const [formData, setFormData] = useState<ItemFormData>({
    name: group?.suggestedName || '',
    category: group ? getDetectedCategory(group) : 'Other',
    color: group?.suggestedColor || '',
    brand: '',
    size: '',
    tags: []
  })

  // Reset form when current group changes
  useEffect(() => {
    if (group) {
      setFormData({
        name: group.suggestedName,
        category: getDetectedCategory(group),
        color: group.suggestedColor.charAt(0).toUpperCase() + group.suggestedColor.slice(1),
        brand: '',
        size: '',
        tags: []
      })
    }
  }, [group])

  if (!group) return null

  const colorHex = COLOR_MAP[group.suggestedColor.toLowerCase()] || '#9ca3af'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(group.id, formData)
  }

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < groups.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Create Item
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentIndex + 1} of {groups.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate(currentIndex - 1)}
              disabled={!canGoPrev || isSaving}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => onNavigate(currentIndex + 1)}
              disabled={!canGoNext || isSaving}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="p-4 space-y-6">
            {/* Image Preview */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {group.images.map((image) => (
                <div
                  key={image.id}
                  className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700"
                >
                  <img
                    src={image.previewUrl}
                    alt="Item preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Beta Warning */}
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-700 dark:text-amber-300">
                <span className="font-semibold">Beta Feature:</span> Auto-detected name, category, and color may be inaccurate. Please review and correct before saving.
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                className="input-field"
                placeholder="e.g., Blue Denim Jacket"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  category: e.target.value as ClothingCategory
                }))}
                required
                className="input-field"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Color (auto-detected)
              </label>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-600"
                  style={{ backgroundColor: colorHex }}
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="input-field flex-1"
                  placeholder="e.g., Blue"
                />
              </div>
            </div>

            {/* Brand & Size Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  className="input-field"
                  placeholder="e.g., Nike"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Size
                </label>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                  className="input-field"
                  placeholder="e.g., M, 32, 10"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {suggestedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                      formData.tags.includes(tag)
                        ? 'bg-wardrobe-100 dark:bg-wardrobe-900/30 text-wardrobe-700 dark:text-wardrobe-400 border border-wardrobe-300 dark:border-wardrobe-700'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            type="button"
            onClick={() => onSkip(group.id)}
            disabled={isSaving}
            className="btn-secondary"
          >
            Skip
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSaving || !formData.name.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : currentIndex === groups.length - 1 ? (
                'Create & Finish'
              ) : (
                'Create & Next'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

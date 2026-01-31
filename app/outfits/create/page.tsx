'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { useWardrobe } from '@/contexts/WardrobeContext'
import { ArrowLeft, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function CreateOutfitPage() {
  const router = useRouter()
  const { items, addNewOutfit, loading } = useWardrobe()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [saving, setSaving] = useState(false)

  const toggleItem = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const addTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Please enter an outfit name')
      return
    }

    if (selectedItems.length < 2) {
      toast.error('Please select at least 2 items')
      return
    }

    setSaving(true)
    const result = await addNewOutfit({
      name: name.trim(),
      description: description.trim() || undefined,
      items: selectedItems,
      tags,
      isFavorite
    })

    if (result) {
      toast.success('Outfit created!')
      router.push('/outfits')
    } else {
      toast.error('Failed to create outfit')
    }
    setSaving(false)
  }

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, typeof items>)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="lg:pl-64">
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/outfits" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Outfit</h1>
              <p className="mt-1 text-gray-600">
                Combine items from your wardrobe into a new outfit.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="max-w-4xl">
            {/* Outfit Details */}
            <div className="card mb-6">
              <h2 className="text-lg font-semibold mb-4">Outfit Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Casual Friday"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wardrobe-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add notes about this outfit..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wardrobe-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-wardrobe-100 text-wardrobe-700 rounded-full text-sm">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-wardrobe-900">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Add a tag..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wardrobe-500"
                    />
                    <button type="button" onClick={addTag} className="btn-secondary">
                      Add
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFavorite}
                    onChange={(e) => setIsFavorite(e.target.checked)}
                    className="h-4 w-4 text-wardrobe-600 focus:ring-wardrobe-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Mark as favorite</span>
                </label>
              </div>
            </div>

            {/* Item Selection */}
            <div className="card mb-6">
              <h2 className="text-lg font-semibold mb-4">
                Select Items ({selectedItems.length} selected)
              </h2>

              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading items...</div>
              ) : items.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No items in your wardrobe yet.</p>
                  <Link href="/add-item" className="btn-primary">
                    Add Your First Item
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedItems).map(([category, categoryItems]) => (
                    <div key={category}>
                      <h3 className="text-sm font-medium text-gray-500 mb-3">{category}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {categoryItems.map(item => {
                          const isSelected = selectedItems.includes(item.id)
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => toggleItem(item.id)}
                              className={`relative rounded-lg border-2 overflow-hidden transition-all ${
                                isSelected
                                  ? 'border-wardrobe-500 ring-2 ring-wardrobe-200'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {item.images[0] ? (
                                <img
                                  src={item.images[0]}
                                  alt={item.name}
                                  className="w-full aspect-square object-cover"
                                />
                              ) : (
                                <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
                                  <span className="text-gray-400 text-xs">No image</span>
                                </div>
                              )}
                              <div className="p-2 bg-white">
                                <p className="text-xs font-medium text-gray-900 truncate">{item.name}</p>
                              </div>
                              {isSelected && (
                                <div className="absolute top-2 right-2 bg-wardrobe-500 text-white rounded-full p-1">
                                  <Check className="h-3 w-3" />
                                </div>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3">
              <Link href="/outfits" className="btn-secondary">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving || selectedItems.length < 2}
                className="btn-primary"
              >
                {saving ? 'Creating...' : 'Create Outfit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

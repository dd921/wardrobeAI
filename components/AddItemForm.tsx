'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X, Plus, Camera } from 'lucide-react'
import { ClothingCategory } from '@/types/wardrobe'
import { generateId } from '@/lib/utils'
import { useWardrobe } from '@/contexts/WardrobeContext'
import toast from 'react-hot-toast'

const addItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.enum([
    'Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories',
    'Undergarments', 'Sleepwear', 'Activewear', 'Formal Wear',
    'Swimwear', 'Loungewear', 'Other'
  ] as const),
  brand: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  material: z.string().optional(),
  price: z.number().min(0).optional(),
  careInstructions: z.string().optional(),
  tags: z.array(z.string()).default([])
})

type AddItemFormData = z.infer<typeof addItemSchema>

const categories: ClothingCategory[] = [
  'Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories',
  'Undergarments', 'Sleepwear', 'Activewear', 'Formal Wear',
  'Swimwear', 'Loungewear', 'Other'
]

const suggestedTags = [
  'Blue', 'Red', 'Green', 'Black', 'White', 'Gray',
  'Cotton', 'Denim', 'Leather', 'Silk', 'Wool',
  'Casual', 'Formal', 'Athletic', 'Vintage', 'Modern',
  'Summer', 'Winter', 'Spring', 'Fall',
  'Work', 'Party', 'Everyday', 'Special Occasion'
]

export default function AddItemForm() {
  const router = useRouter()
  const { addItem } = useWardrobe()
  const [images, setImages] = useState<string[]>([])
  const [customTags, setCustomTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<AddItemFormData>({
    resolver: zodResolver(addItemSchema),
    defaultValues: {
      tags: [],
      category: 'Tops'
    }
  })

  const watchedTags = watch('tags')

  const addImage = () => {
    // In a real app, this would handle file upload
    const newImageId = generateId()
    setImages(prev => [...prev, newImageId])
    toast.success('Image added (mock)')
  }

  const removeImage = (imageId: string) => {
    setImages(prev => prev.filter(id => id !== imageId))
  }

  const addTag = (tag: string) => {
    if (!watchedTags.includes(tag)) {
      setValue('tags', [...watchedTags, tag])
    }
  }

  const removeTag = (tag: string) => {
    setValue('tags', watchedTags.filter(t => t !== tag))
  }

  const addCustomTag = () => {
    const input = document.getElementById('customTag') as HTMLInputElement
    const value = input.value.trim()
    if (value && !watchedTags.includes(value)) {
      setValue('tags', [...watchedTags, value])
      input.value = ''
      toast.success(`Tag "${value}" added`)
    }
  }

  const onSubmit = async (data: AddItemFormData) => {
    setIsSubmitting(true)
    
    try {
      const newItem = await addItem({
        name: data.name,
        description: data.description,
        category: data.category,
        tags: data.tags,
        images: images, // TODO: Implement actual image upload
        brand: data.brand,
        size: data.size,
        color: data.color,
        material: data.material,
        price: data.price,
        careInstructions: data.careInstructions,
        isFavorite: false
      })
      
      if (newItem) {
        toast.success('Item added successfully!')
        router.push('/wardrobe')
      } else {
        toast.error('Failed to add item. Please try again.')
      }
    } catch (error) {
      toast.error('Failed to add item. Please try again.')
      console.error('Error adding item:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Photos */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Photos</h3>
            
            <div className="space-y-4">
              {images.map((imageId) => (
                <div key={imageId} className="relative">
                  <div className="aspect-[3/4] bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-4xl text-gray-400">📷</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(imageId)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={addImage}
                  className="w-full aspect-[3/4] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                >
                  <Upload className="h-8 w-8 mb-2" />
                  <span className="text-sm font-medium">Add Photo</span>
                </button>
                
                <button
                  type="button"
                  className="w-full py-2 px-4 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  {...register('name')}
                  className="input-field"
                  placeholder="e.g., Blue Denim Jacket"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  id="category"
                  {...register('category')}
                  className="input-field"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  {...register('description')}
                  rows={3}
                  className="input-field"
                  placeholder="Describe your item..."
                />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  id="brand"
                  {...register('brand')}
                  className="input-field"
                  placeholder="e.g., Nike, Levi's"
                />
              </div>

              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
                  Size
                </label>
                <input
                  type="text"
                  id="size"
                  {...register('size')}
                  className="input-field"
                  placeholder="e.g., M, 9, One Size"
                />
              </div>

              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="text"
                  id="color"
                  {...register('color')}
                  className="input-field"
                  placeholder="e.g., Blue, Red"
                />
              </div>

              <div>
                <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-1">
                  Material
                </label>
                <input
                  type="text"
                  id="material"
                  {...register('material')}
                  className="input-field"
                  placeholder="e.g., Cotton, Denim"
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="price"
                    step="0.01"
                    min="0"
                    {...register('price', { valueAsNumber: true })}
                    className="input-field pl-7"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="careInstructions" className="block text-sm font-medium text-gray-700 mb-1">
                  Care Instructions
                </label>
                <textarea
                  id="careInstructions"
                  {...register('careInstructions')}
                  rows={2}
                  className="input-field"
                  placeholder="e.g., Machine wash cold, tumble dry low"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
            
            <div className="space-y-4">
              {/* Selected Tags */}
              {watchedTags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {watchedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-wardrobe-100 text-wardrobe-700"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-wardrobe-600 hover:text-wardrobe-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Suggested Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      disabled={watchedTags.includes(tag)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        watchedTags.includes(tag)
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Tag Input */}
              <div>
                <label htmlFor="customTag" className="block text-sm font-medium text-gray-700 mb-2">
                  Add Custom Tag
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    id="customTag"
                    className="input-field flex-1"
                    placeholder="Enter custom tag..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                  />
                  <button
                    type="button"
                    onClick={addCustomTag}
                    className="btn-secondary"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}


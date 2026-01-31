'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X, Plus, Camera, Loader2 } from 'lucide-react'
import { ClothingItem, ClothingCategory } from '@/types/wardrobe'
import { useWardrobe } from '@/contexts/WardrobeContext'
import { uploadImages, resizeImage } from '@/lib/imageUpload'
import toast from 'react-hot-toast'

const editItemSchema = z.object({
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

type EditItemFormData = z.infer<typeof editItemSchema>

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

interface EditItemFormProps {
  item: ClothingItem
}

export default function EditItemForm({ item }: EditItemFormProps) {
  const router = useRouter()
  const { updateItem } = useWardrobe()
  const [images, setImages] = useState<string[]>(item.images || [])
  const [newImageFiles, setNewImageFiles] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<EditItemFormData>({
    resolver: zodResolver(editItemSchema),
    defaultValues: {
      name: item.name,
      description: item.description || '',
      category: item.category,
      brand: item.brand || '',
      size: item.size || '',
      color: item.color || '',
      material: item.material || '',
      price: item.price || undefined,
      careInstructions: item.careInstructions || '',
      tags: item.tags || []
    }
  })

  const watchedTags = watch('tags')

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'))

    if (imageFiles.length === 0) {
      toast.error('Please select image files only')
      return
    }

    const resizedFiles: File[] = []
    for (const file of imageFiles) {
      try {
        const resizedFile = await resizeImage(file, 1200, 1200, 0.8)
        resizedFiles.push(resizedFile)
      } catch (error) {
        resizedFiles.push(file)
      }
    }

    const previews = resizedFiles.map(file => URL.createObjectURL(file))
    setNewImageFiles(prev => [...prev, ...resizedFiles])
    setNewImagePreviews(prev => [...prev, ...previews])
    toast.success(`${resizedFiles.length} image(s) added`)
  }

  const removeExistingImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newImagePreviews[index])
    setNewImageFiles(prev => prev.filter((_, i) => i !== index))
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index))
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
    }
  }

  const onSubmit = async (data: EditItemFormData) => {
    setIsSubmitting(true)

    try {
      let allImageUrls = [...images]

      if (newImageFiles.length > 0) {
        setIsUploading(true)
        const results = await uploadImages(newImageFiles, item.id, () => {})
        const successfulUploads = results.filter(r => r.success && r.url).map(r => r.url!)
        allImageUrls = [...allImageUrls, ...successfulUploads]
        setIsUploading(false)
      }

      const updatedItem = await updateItem(item.id, {
        name: data.name,
        description: data.description,
        category: data.category,
        tags: data.tags,
        images: allImageUrls,
        brand: data.brand,
        size: data.size,
        color: data.color,
        material: data.material,
        price: data.price,
        careInstructions: data.careInstructions,
        isFavorite: item.isFavorite
      })

      if (updatedItem) {
        toast.success('Item updated successfully!')
        router.push(`/wardrobe/${item.id}`)
      } else {
        toast.error('Failed to update item')
      }
    } catch (error) {
      toast.error('Failed to update item')
      console.error('Error updating item:', error)
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
              {/* Existing Images */}
              {images.map((url, index) => (
                <div key={`existing-${index}`} className="relative">
                  <div className="aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden">
                    <img src={url} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {/* New Image Previews */}
              {newImagePreviews.map((preview, index) => (
                <div key={`new-${index}`} className="relative">
                  <div className="aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden">
                    <img src={preview} alt={`New ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {/* Add Photo Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isSubmitting}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 flex flex-col items-center justify-center min-h-[100px]"
              >
                <Upload className="h-6 w-6 mb-2" />
                <span className="text-sm">Add Photos</span>
              </button>

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isUploading || isSubmitting}
                className="w-full py-2 px-4 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-center"
              >
                <Camera className="h-4 w-4 mr-2" />
                Take Photo
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Right Column - Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" id="name" {...register('name')} className="input-field" />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select id="category" {...register('category')} className="input-field">
                  {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea id="description" {...register('description')} rows={3} className="input-field" />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input type="text" id="brand" {...register('brand')} className="input-field" />
              </div>
              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                <input type="text" id="size" {...register('size')} className="input-field" />
              </div>
              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input type="text" id="color" {...register('color')} className="input-field" />
              </div>
              <div>
                <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                <input type="text" id="material" {...register('material')} className="input-field" />
              </div>
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                  <input type="number" id="price" step="0.01" min="0" {...register('price', { valueAsNumber: true })} className="input-field pl-7" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="careInstructions" className="block text-sm font-medium text-gray-700 mb-1">Care Instructions</label>
                <textarea id="careInstructions" {...register('careInstructions')} rows={2} className="input-field" />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>

            {watchedTags.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Selected Tags</label>
                <div className="flex flex-wrap gap-2">
                  {watchedTags.map((tag) => (
                    <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-wardrobe-100 text-wardrobe-700">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="ml-2">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Suggested Tags</label>
              <div className="flex flex-wrap gap-2">
                {suggestedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    disabled={watchedTags.includes(tag)}
                    className={`px-3 py-1 rounded-full text-sm border ${watchedTags.includes(tag) ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="customTag" className="block text-sm font-medium text-gray-700 mb-2">Add Custom Tag</label>
              <div className="flex space-x-2">
                <input type="text" id="customTag" className="input-field flex-1" placeholder="Enter custom tag..." onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())} />
                <button type="button" onClick={addCustomTag} className="btn-secondary"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting || isUploading} className="btn-primary disabled:opacity-50">
              {isUploading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</>
              ) : isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

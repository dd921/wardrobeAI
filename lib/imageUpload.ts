import { supabase } from './supabase'

export interface ImageUploadResult {
  success: boolean
  url?: string
  error?: string
}

export interface ImageUploadProgress {
  file: File
  progress: number
  status: 'uploading' | 'completed' | 'error'
  url?: string
  error?: string
}

/**
 * Upload a single image file to Supabase Storage
 */
export const uploadImage = async (
  file: File,
  itemId: string,
  onProgress?: (progress: number) => void
): Promise<ImageUploadResult> => {
  try {
    console.log('Starting upload for file:', {
      name: file.name,
      size: file.size,
      type: file.type,
      itemId
    })

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type:', file.type)
      return {
        success: false,
        error: 'File must be an image'
      }
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      console.error('File too large:', file.size, 'bytes')
      return {
        success: false,
        error: 'File size must be less than 10MB'
      }
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Supabase not configured')
      return {
        success: false,
        error: 'Storage not configured. Please check your environment variables.'
      }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${itemId}/${fileName}`

    console.log('Uploading to path:', filePath)

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('wardrobe-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return {
        success: false,
        error: `Upload failed: ${error.message}`
      }
    }

    console.log('Upload successful, data:', data)

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('wardrobe-images')
      .getPublicUrl(filePath)

    console.log('Public URL generated:', urlData.publicUrl)

    if (onProgress) {
      onProgress(100)
    }

    return {
      success: true,
      url: urlData.publicUrl
    }
  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

/**
 * Upload multiple images with progress tracking
 */
export const uploadImages = async (
  files: File[],
  itemId: string,
  onProgress?: (progress: ImageUploadProgress[]) => void
): Promise<ImageUploadResult[]> => {
  const results: ImageUploadResult[] = []
  const progress: ImageUploadProgress[] = files.map(file => ({
    file,
    progress: 0,
    status: 'uploading'
  }))

  // Update progress callback
  if (onProgress) {
    onProgress([...progress])
  }

  // Upload files sequentially to avoid overwhelming the server
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    
    try {
      const result = await uploadImage(file, itemId, (fileProgress) => {
        progress[i].progress = fileProgress
        if (onProgress) {
          onProgress([...progress])
        }
      })

      if (result.success) {
        progress[i].status = 'completed'
        progress[i].url = result.url
      } else {
        progress[i].status = 'error'
        progress[i].error = result.error
      }
    } catch (error) {
      progress[i].status = 'error'
      progress[i].error = error instanceof Error ? error.message : 'Upload failed'
    }

    results.push({
      success: progress[i].status === 'completed',
      url: progress[i].url,
      error: progress[i].error
    })

    // Update progress callback
    if (onProgress) {
      onProgress([...progress])
    }
  }

  return results
}

/**
 * Delete an image from Supabase Storage
 */
export const deleteImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extract file path from URL
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/')
    const bucketIndex = pathParts.findIndex(part => part === 'wardrobe-images')
    
    if (bucketIndex === -1) {
      console.error('Invalid image URL format')
      return false
    }

    const filePath = pathParts.slice(bucketIndex + 1).join('/')
    
    const { error } = await supabase.storage
      .from('wardrobe-images')
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete error:', error)
    return false
  }
}

/**
 * Get image dimensions from file
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Resize image file to fit within specified dimensions
 */
export const resizeImage = (
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width *= ratio
        height *= ratio
      }

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height

      // Draw and resize
      ctx?.drawImage(img, 0, 0, width, height)

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(resizedFile)
          } else {
            reject(new Error('Failed to resize image'))
          }
        },
        file.type,
        quality
      )
    }

    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

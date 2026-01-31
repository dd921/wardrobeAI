"use client"

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { generateId } from '@/lib/utils'
import { X, Upload } from 'lucide-react'

export default function BulkUploadPage() {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const onFiles = (fileList: FileList | null) => {
    if (!fileList) return
    const arr = Array.from(fileList)
    setFiles(prev => [...prev, ...arr])
    const newPreviews = arr.map(f => URL.createObjectURL(f))
    setPreviews(prev => [...prev, ...newPreviews])
  }

  const removeAt = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const uploadAll = async () => {
    if (files.length === 0) return
    setUploading(true)
    try {
      // Assumption: you have a Supabase storage bucket named 'wardrobe-images' and public access or
      // appropriate policies configured. Adjust bucket name as needed.
      const bucket = 'wardrobe-images'
      const uploadedUrls: string[] = []

      for (const file of files) {
        const id = generateId()
        const ext = file.name.split('.').pop()
        const filePath = `${id}.${ext}`
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, { upsert: false })

        if (error) {
          console.error('Upload error', error)
          throw error
        }

  // Get public URL (if bucket is public) otherwise get a signed URL
  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filePath)
  const publicUrl = publicData?.publicUrl ?? ''
  uploadedUrls.push(publicUrl)
      }

      // TODO: Persist uploadedUrls to your DB or context
      alert(`Uploaded ${uploadedUrls.length} files`)
      // Cleanup previews and files
      setFiles([])
      previews.forEach(url => URL.revokeObjectURL(url))
      setPreviews([])
    } catch (e) {
      console.error(e)
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-6">Bulk Upload</h1>

      <div className="card p-6">
        <label className="block mb-4">
          <span className="sr-only">Choose photos</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => onFiles(e.target.files)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-wardrobe-500 file:text-white hover:file:bg-wardrobe-600"
          />
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {previews.map((src, i) => (
            <div key={src} className="relative">
              <img src={src} className="h-32 w-full object-cover rounded-lg" alt={`preview-${i}`} />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
              >
                <X className="h-4 w-4 text-red-600" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button type="button" onClick={() => { setFiles([]); previews.forEach(u => URL.revokeObjectURL(u)); setPreviews([]) }} className="btn-secondary">Clear</button>
          <button type="button" onClick={uploadAll} disabled={uploading || files.length === 0} className="btn-primary">
            {uploading ? 'Uploading...' : (<><Upload className="h-4 w-4 mr-2 inline" /> Upload All</>)}
          </button>
        </div>
      </div>
    </div>
  )
}

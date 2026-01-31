'use client'

import { useState } from 'react'
import { useWardrobe } from '@/contexts/WardrobeContext'

export default function ImageTest() {
  const { items } = useWardrobe()
  const [selectedItem, setSelectedItem] = useState<number>(0)

  const item = items[selectedItem]

  if (!item) {
    return <div>No items found</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Image Test</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select Item:</label>
        <select 
          value={selectedItem} 
          onChange={(e) => setSelectedItem(Number(e.target.value))}
          className="border rounded px-3 py-2"
        >
          {items.map((item, index) => (
            <option key={item.id} value={index}>
              {item.name} (ID: {item.id})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Item Details</h3>
          <div className="bg-gray-100 p-4 rounded">
            <p><strong>Name:</strong> {item.name}</p>
            <p><strong>ID:</strong> {item.id}</p>
            <p><strong>Images Count:</strong> {item.images?.length || 0}</p>
            <p><strong>Images Array:</strong></p>
            <pre className="text-xs bg-white p-2 rounded mt-2 overflow-auto">
              {JSON.stringify(item.images, null, 2)}
            </pre>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Image Display</h3>
          <div className="border rounded p-4">
            {item.images && item.images.length > 0 ? (
              <div className="space-y-4">
                {item.images.map((imageUrl, index) => (
                  <div key={index} className="border rounded p-2">
                    <p className="text-sm text-gray-600 mb-2">Image {index + 1}:</p>
                    <p className="text-xs text-gray-500 mb-2 break-all">{imageUrl}</p>
                    <div className="aspect-[3/4] bg-gray-200 rounded overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={`${item.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onLoad={() => console.log(`Image ${index + 1} loaded successfully`)}
                        onError={(e) => {
                          console.error(`Image ${index + 1} failed to load:`, imageUrl)
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const parent = target.parentElement
                          if (parent) {
                            parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-red-500">❌ Failed to load</div>'
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No images found for this item
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

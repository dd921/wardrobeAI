'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Heart } from 'lucide-react'
import Navigation from '@/components/Navigation'
import { useWardrobe } from '@/contexts/WardrobeContext'
import { formatPrice, formatRelativeDate } from '@/lib/utils'

export default function ItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { items, updateItem } = useWardrobe()
  const id = params.id as string
  const item = items.find((i) => i.id === id)

  const toggleFavorite = async () => {
    if (!item) return
    const success = await updateItem(item.id, { isFavorite: !item.isFavorite })
    if (success) {
      // Item updated in context
    }
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="lg:pl-64">
          <div className="px-4 py-8 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Item not found.</p>
              <Link href="/wardrobe" className="btn-primary inline-flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Wardrobe
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="lg:pl-64">
        <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <Link
            href="/wardrobe"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Wardrobe
          </Link>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Images */}
              <div className="aspect-[3/4] bg-gray-200">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl text-gray-400">👕</span>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-6 md:p-8 flex flex-col">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleFavorite}
                      className={`p-2 rounded-full transition-colors ${
                        item.isFavorite
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-400 hover:bg-red-500 hover:text-white'
                      }`}
                      title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart className={`h-5 w-5 ${item.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <Link
                      href={`/wardrobe/${item.id}/edit`}
                      className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-wardrobe-100 hover:text-wardrobe-700 transition-colors"
                      title="Edit item"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                  </div>
                </div>

                <span className="inline-block text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded mb-4 w-fit">
                  {item.category}
                </span>

                {item.description && (
                  <p className="text-gray-600 mb-4">{item.description}</p>
                )}

                <dl className="space-y-3 text-sm">
                  {item.brand && (
                    <div>
                      <dt className="text-gray-500">Brand</dt>
                      <dd className="font-medium text-gray-900">{item.brand}</dd>
                    </div>
                  )}
                  {item.color && (
                    <div>
                      <dt className="text-gray-500">Color</dt>
                      <dd className="font-medium text-gray-900">{item.color}</dd>
                    </div>
                  )}
                  {item.size && (
                    <div>
                      <dt className="text-gray-500">Size</dt>
                      <dd className="font-medium text-gray-900">{item.size}</dd>
                    </div>
                  )}
                  {item.material && (
                    <div>
                      <dt className="text-gray-500">Material</dt>
                      <dd className="font-medium text-gray-900">{item.material}</dd>
                    </div>
                  )}
                  {item.price != null && (
                    <div>
                      <dt className="text-gray-500">Price</dt>
                      <dd className="font-medium text-gray-900">{formatPrice(item.price)}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-gray-500">Worn</dt>
                    <dd className="font-medium text-gray-900">{item.wearCount} times</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Last worn</dt>
                    <dd className="font-medium text-gray-900">
                      {item.lastWorn ? formatRelativeDate(item.lastWorn) : 'Never'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Added</dt>
                    <dd className="font-medium text-gray-900">
                      {formatRelativeDate(item.createdAt)}
                    </dd>
                  </div>
                </dl>

                {item.tags && item.tags.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <dt className="text-gray-500 text-sm mb-2">Tags</dt>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-2 py-1 text-xs bg-wardrobe-100 text-wardrobe-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {item.careInstructions && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <dt className="text-gray-500 text-sm mb-2">Care</dt>
                    <dd className="text-sm text-gray-700">{item.careInstructions}</dd>
                  </div>
                )}

                <div className="mt-auto pt-6">
                  <Link
                    href={`/wardrobe/${item.id}/edit`}
                    className="btn-primary inline-flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Item
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

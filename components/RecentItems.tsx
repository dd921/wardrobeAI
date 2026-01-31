'use client'

import Link from 'next/link'
import { formatRelativeDate } from '@/lib/utils'
import { Eye, Heart } from 'lucide-react'
import { useWardrobe } from '@/contexts/WardrobeContext'

export default function RecentItems() {
  const { items, loading } = useWardrobe()

  // Get the 4 most recently added items
  const recentItems = [...items]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Items</h2>
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 rounded-xl">
              <div className="w-12 h-12 shimmer-loading rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 shimmer-loading rounded-lg w-3/4" />
                <div className="h-3 shimmer-loading rounded-lg w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Items</h2>
        {items.length > 0 && (
          <Link
            href="/wardrobe"
            className="text-sm text-wardrobe-600 dark:text-wardrobe-400 hover:text-wardrobe-700 dark:hover:text-wardrobe-300 font-medium transition-colors"
          >
            View all
          </Link>
        )}
      </div>

      {recentItems.length > 0 ? (
        <div className="space-y-3">
          {recentItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50/80 dark:hover:bg-gray-700/50 hover:shadow-soft transition-all duration-200"
            >
              <div className="flex-shrink-0">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover shadow-soft ring-1 ring-gray-100 dark:ring-gray-700"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-inner-soft">
                    <span className="text-lg">👕</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.category} • {formatRelativeDate(item.createdAt)}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {item.isFavorite && (
                  <Heart className="h-4 w-4 text-red-500 fill-current" />
                )}
                <Link
                  href={`/wardrobe/${item.id}`}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                >
                  <Eye className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No items yet</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Start building your wardrobe by adding your first clothing item.
          </p>
          <div className="mt-6">
            <Link
              href="/add-item"
              className="btn-primary"
            >
              Add Item
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

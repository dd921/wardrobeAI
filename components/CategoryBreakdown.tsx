'use client'

import { ClothingCategory } from '@/types/wardrobe'
import { useWardrobe } from '@/contexts/WardrobeContext'

const categoryColors: Record<ClothingCategory, string> = {
  'Tops': 'bg-blue-500',
  'Bottoms': 'bg-green-500',
  'Outerwear': 'bg-purple-500',
  'Shoes': 'bg-orange-500',
  'Accessories': 'bg-pink-500',
  'Undergarments': 'bg-gray-500',
  'Sleepwear': 'bg-indigo-500',
  'Activewear': 'bg-red-500',
  'Formal Wear': 'bg-yellow-500',
  'Swimwear': 'bg-cyan-500',
  'Loungewear': 'bg-amber-500',
  'Other': 'bg-slate-500'
}

export default function CategoryBreakdown() {
  const { stats, loading } = useWardrobe()

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Category Breakdown</h2>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full shimmer-loading" />
                <div className="h-4 shimmer-loading rounded-lg w-20" />
              </div>
              <div className="h-2 shimmer-loading rounded-full w-32" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const categoryData = stats?.categoryBreakdown || {}
  const totalItems = Object.values(categoryData).reduce((sum, count) => sum + count, 0)

  const sortedCategories = Object.entries(categoryData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)

  if (sortedCategories.length === 0) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Category Breakdown</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">No items yet. Add some clothes to see your category breakdown.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Category Breakdown</h2>

      <div className="space-y-4">
        {sortedCategories.map(([category, count]) => {
          const percentage = totalItems > 0 ? ((count / totalItems) * 100).toFixed(1) : '0'
          const colorClass = categoryColors[category as ClothingCategory] || 'bg-gray-500'

          return (
            <div key={category} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${colorClass} ring-2 ring-white dark:ring-gray-800 shadow-soft`} />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {category}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex-1 w-32 bg-gray-100 dark:bg-gray-700 rounded-full h-2 shadow-inner-soft overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${colorClass} transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                  {count}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-500 w-12 text-right">
                  {percentage}%
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Total Items</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{totalItems}</span>
        </div>
      </div>
    </div>
  )
}

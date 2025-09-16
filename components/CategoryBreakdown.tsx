'use client'

import { ClothingCategory } from '@/types/wardrobe'

// Mock data - in a real app, this would come from your data store
const categoryData: Record<ClothingCategory, number> = {
  'Tops': 32,
  'Bottoms': 28,
  'Outerwear': 15,
  'Shoes': 18,
  'Accessories': 12,
  'Undergarments': 8,
  'Sleepwear': 6,
  'Activewear': 14,
  'Formal Wear': 4,
  'Swimwear': 3,
  'Loungewear': 5,
  'Other': 2
}

const categoryColors = {
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

const totalItems = Object.values(categoryData).reduce((sum, count) => sum + count, 0)

export default function CategoryBreakdown() {
  const sortedCategories = Object.entries(categoryData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8) // Show top 8 categories

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Category Breakdown</h2>
      
      <div className="space-y-4">
        {sortedCategories.map(([category, count]) => {
          const percentage = ((count / totalItems) * 100).toFixed(1)
          const colorClass = categoryColors[category as ClothingCategory]
          
          return (
            <div key={category} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${colorClass}`} />
                <span className="text-sm font-medium text-gray-900">
                  {category}
                </span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex-1 w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${colorClass}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {count}
                </span>
                <span className="text-sm text-gray-500 w-12 text-right">
                  {percentage}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Items</span>
          <span className="font-medium text-gray-900">{totalItems}</span>
        </div>
      </div>
    </div>
  )
}




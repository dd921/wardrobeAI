'use client'

import Link from 'next/link'
import {
  Plus,
  Heart,
  Search,
  Upload,
  Camera,
  Palette,
  ChevronRight
} from 'lucide-react'

const actions = [
  {
    name: 'Add Clothing Item',
    description: 'Add a new piece to your wardrobe',
    href: '/add-item',
    icon: Plus,
    gradient: 'from-wardrobe-500 to-wardrobe-600'
  },
  {
    name: 'Create Outfit',
    description: 'Combine items into a new outfit',
    href: '/outfits/create',
    icon: Heart,
    gradient: 'from-pink-500 to-pink-600'
  },
  {
    name: 'Quick Search',
    description: 'Find items in your wardrobe',
    href: '/search',
    icon: Search,
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    name: 'Bulk Upload',
    description: 'Upload multiple photos at once',
    href: '/bulk-upload',
    icon: Upload,
    gradient: 'from-green-500 to-green-600'
  },
  {
    name: 'Take Photo',
    description: 'Use camera to add items',
    href: '/camera',
    icon: Camera,
    gradient: 'from-purple-500 to-purple-600'
  },
  {
    name: 'Color Analysis',
    description: 'Analyze your wardrobe colors',
    href: '/color-analysis',
    icon: Palette,
    gradient: 'from-orange-500 to-orange-600'
  }
]

export default function QuickActions() {
  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 gap-3">
        {actions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className="group relative flex items-center space-x-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className={`flex-shrink-0 rounded-xl p-2.5 bg-gradient-to-br ${action.gradient} shadow-soft group-hover:scale-110 transition-transform duration-200`}>
              <action.icon className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-wardrobe-600 dark:group-hover:text-wardrobe-400 transition-colors duration-200">
                {action.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {action.description}
              </p>
            </div>
            <div className="flex-shrink-0">
              <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all duration-200" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

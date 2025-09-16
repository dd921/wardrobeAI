'use client'

import Link from 'next/link'
import { 
  Plus, 
  Heart, 
  Search, 
  Upload,
  Camera,
  Palette
} from 'lucide-react'

const actions = [
  {
    name: 'Add Clothing Item',
    description: 'Add a new piece to your wardrobe',
    href: '/add-item',
    icon: Plus,
    color: 'bg-wardrobe-500 hover:bg-wardrobe-600'
  },
  {
    name: 'Create Outfit',
    description: 'Combine items into a new outfit',
    href: '/outfits/create',
    icon: Heart,
    color: 'bg-pink-500 hover:bg-pink-600'
  },
  {
    name: 'Quick Search',
    description: 'Find items in your wardrobe',
    href: '/search',
    icon: Search,
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    name: 'Bulk Upload',
    description: 'Upload multiple photos at once',
    href: '/bulk-upload',
    icon: Upload,
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    name: 'Take Photo',
    description: 'Use camera to add items',
    href: '/camera',
    icon: Camera,
    color: 'bg-purple-500 hover:bg-purple-600'
  },
  {
    name: 'Color Analysis',
    description: 'Analyze your wardrobe colors',
    href: '/color-analysis',
    icon: Palette,
    color: 'bg-orange-500 hover:bg-orange-600'
  }
]

export default function QuickActions() {
  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 gap-3">
        {actions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className="group relative flex items-center space-x-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm hover:border-gray-300 hover:shadow-md transition-all duration-200"
          >
            <div className={`flex-shrink-0 rounded-lg p-2 text-white ${action.color} transition-colors duration-200`}>
              <action.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 group-hover:text-wardrobe-600 transition-colors duration-200">
                {action.name}
              </p>
              <p className="text-xs text-gray-500">
                {action.description}
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="h-5 w-5 text-gray-400 group-hover:text-gray-500 transition-colors duration-200">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}




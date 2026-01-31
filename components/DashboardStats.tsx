'use client'

import { 
  Shirt, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Heart,
  Tag
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useWardrobe } from '@/contexts/WardrobeContext'

export default function DashboardStats() {
  const { stats, loading, error } = useWardrobe()

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Overview</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="relative overflow-hidden rounded-lg bg-white px-4 py-5 border border-gray-200 animate-pulse">
              <div className="absolute rounded-md bg-gray-300 p-3">
                <div className="h-6 w-6 bg-gray-400 rounded"></div>
              </div>
              <div className="ml-16 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-20"></div>
                <div className="h-8 bg-gray-300 rounded w-16"></div>
                <div className="h-3 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Overview</h2>
        <div className="text-center py-8">
          <p className="text-red-600">Error loading stats: {error}</p>
        </div>
      </div>
    )
  }

  const mostWornItem = stats?.mostWorn?.[0]
  const categoryCount = Object.keys(stats?.categoryBreakdown || {}).length

  const statsData = [
    {
      name: 'Total Items',
      value: stats?.totalItems || 0,
      icon: Shirt,
      description: 'in your wardrobe'
    },
    {
      name: 'Total Value',
      value: formatPrice(stats?.totalValue || 0),
      icon: DollarSign,
      description: 'estimated worth'
    },
    {
      name: 'Most Worn',
      value: mostWornItem ? `${mostWornItem.wearCount}x` : '—',
      icon: TrendingUp,
      description: mostWornItem?.name || 'No items yet'
    },
    {
      name: 'Added This Week',
      value: stats?.recentItems || 0,
      icon: Calendar,
      description: 'new items'
    },
    {
      name: 'Favorites',
      value: stats?.favoriteItems || 0,
      icon: Heart,
      description: 'items marked'
    },
    {
      name: 'Categories',
      value: categoryCount,
      icon: Tag,
      description: 'in use'
    }
  ]

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Overview</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statsData.map((stat) => (
          <div key={stat.name} className="relative overflow-hidden rounded-lg bg-white px-4 py-5 border border-gray-200">
            <dt>
              <div className="absolute rounded-md bg-wardrobe-500 p-3">
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16">
              <p className="text-2xl font-semibold text-gray-900">
                {stat.value}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {stat.description}
              </p>
            </dd>
          </div>
        ))}
      </div>
    </div>
  )
}


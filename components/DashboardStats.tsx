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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Overview</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 px-4 py-5 border border-gray-100 dark:border-gray-700 shadow-soft">
              <div className="absolute rounded-xl bg-gray-200 dark:bg-gray-700 p-3 shimmer-loading">
                <div className="h-6 w-6"></div>
              </div>
              <div className="ml-16 space-y-2">
                <div className="h-4 shimmer-loading rounded-lg w-20"></div>
                <div className="h-8 shimmer-loading rounded-lg w-16"></div>
                <div className="h-3 shimmer-loading rounded-lg w-24"></div>
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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Overview</h2>
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400">Error loading stats: {error}</p>
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
      description: 'in your wardrobe',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Total Value',
      value: formatPrice(stats?.totalValue || 0),
      icon: DollarSign,
      description: 'estimated worth',
      gradient: 'from-green-500 to-green-600'
    },
    {
      name: 'Most Worn',
      value: mostWornItem ? `${mostWornItem.wearCount}x` : '—',
      icon: TrendingUp,
      description: mostWornItem?.name || 'No items yet',
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      name: 'Added This Week',
      value: stats?.recentItems || 0,
      icon: Calendar,
      description: 'new items',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Favorites',
      value: stats?.favoriteItems || 0,
      icon: Heart,
      description: 'items marked',
      gradient: 'from-pink-500 to-pink-600'
    },
    {
      name: 'Categories',
      value: categoryCount,
      icon: Tag,
      description: 'in use',
      gradient: 'from-indigo-500 to-indigo-600'
    }
  ]

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Overview</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statsData.map((stat) => (
          <div
            key={stat.name}
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 px-4 py-5 border border-gray-100 dark:border-gray-700 shadow-soft hover:shadow-soft-lg transition-all duration-200"
          >
            <dt>
              <div className={`absolute rounded-xl bg-gradient-to-br ${stat.gradient} p-3 shadow-soft group-hover:scale-110 transition-transform duration-200`}>
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16">
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                {stat.value}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {stat.description}
              </p>
            </dd>
          </div>
        ))}
      </div>
    </div>
  )
}

import Navigation from '@/components/Navigation'
import DashboardStats from '@/components/DashboardStats'
import CategoryBreakdown from '@/components/CategoryBreakdown'

export default function StatsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-900 dark:to-gray-950">
      <Navigation />

      <div className="lg:pl-64">
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Statistics</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400 leading-relaxed">
              Detailed insights about your wardrobe and clothing usage.
            </p>
          </div>

          <div className="space-y-8">
            <DashboardStats />
            <CategoryBreakdown />
          </div>
        </div>
      </div>
    </div>
  )
}

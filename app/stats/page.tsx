import Navigation from '@/components/Navigation'
import DashboardStats from '@/components/DashboardStats'
import CategoryBreakdown from '@/components/CategoryBreakdown'

export default function StatsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="lg:pl-64">
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>
            <p className="mt-2 text-gray-600">
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

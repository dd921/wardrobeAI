import Navigation from '@/components/Navigation'
import ItemGrid from '@/components/ItemGrid'

export default function WardrobePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="lg:pl-64">
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Wardrobe</h1>
            <p className="mt-2 text-gray-600">
              Browse and manage your clothing collection.
            </p>
          </div>
          
          <ItemGrid />
        </div>
      </div>
    </div>
  )
}

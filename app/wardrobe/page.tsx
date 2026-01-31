import Navigation from '@/components/Navigation'
import ItemGrid from '@/components/ItemGrid'

export default function WardrobePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-900 dark:to-gray-950">
      <Navigation />

      <div className="lg:pl-64">
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">My Wardrobe</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400 leading-relaxed">
              Browse and manage your clothing collection.
            </p>
          </div>

          <ItemGrid />
        </div>
      </div>
    </div>
  )
}

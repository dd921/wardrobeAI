import Navigation from '@/components/Navigation'

export default function TagsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="lg:pl-64">
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
            <p className="mt-2 text-gray-600">
              Manage your clothing tags and categories.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500">Tag management coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

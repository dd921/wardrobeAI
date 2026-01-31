'use client'

import { useState, useEffect } from 'react'
import { useWardrobe } from '@/contexts/WardrobeContext'

export default function ErrorTest() {
  const { items, loading, error } = useWardrobe()
  const [testResults, setTestResults] = useState<string[]>([])

  useEffect(() => {
    const results = []
    results.push(`Loading: ${loading}`)
    results.push(`Error: ${error || 'None'}`)
    results.push(`Items count: ${items.length}`)
    results.push(`First item: ${items[0]?.name || 'None'}`)
    setTestResults(results)
  }, [items, loading, error])

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Error Test</h2>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h3 className="font-semibold mb-2">Current State:</h3>
        <ul className="space-y-1">
          {testResults.map((result, index) => (
            <li key={index} className="text-sm">{result}</li>
          ))}
        </ul>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Test Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Refresh the page to see if the error occurs</li>
          <li>Navigate to the wardrobe page</li>
          <li>Check if items load without the "supabase.raw is not a function" error</li>
          <li>Try adding a new item with tags to test the tag functionality</li>
        </ol>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mt-4">
          <h3 className="font-semibold text-red-800 mb-2">Error Details:</h3>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}

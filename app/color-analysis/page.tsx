'use client'

import { useMemo } from 'react'
import Navigation from '@/components/Navigation'
import { useWardrobe } from '@/contexts/WardrobeContext'
import { Palette, TrendingUp, AlertCircle } from 'lucide-react'
import Link from 'next/link'

// Map common color names to hex values for display
const COLOR_MAP: Record<string, string> = {
  'black': '#1a1a1a',
  'white': '#f5f5f5',
  'gray': '#6b7280',
  'grey': '#6b7280',
  'red': '#ef4444',
  'blue': '#3b82f6',
  'green': '#22c55e',
  'yellow': '#eab308',
  'orange': '#f97316',
  'purple': '#a855f7',
  'pink': '#ec4899',
  'brown': '#92400e',
  'beige': '#d4c4a8',
  'tan': '#d2b48c',
  'navy': '#1e3a5f',
  'olive': '#6b7f59',
  'maroon': '#800000',
  'teal': '#14b8a6',
  'coral': '#ff7f50',
  'cream': '#fffdd0',
  'gold': '#ffd700',
  'silver': '#c0c0c0',
  'burgundy': '#722f37',
  'lavender': '#e6e6fa',
  'mint': '#98ff98',
  'peach': '#ffcba4',
  'khaki': '#c3b091',
  'denim': '#1560bd',
}

interface ColorData {
  name: string
  count: number
  percentage: number
  hex: string
  items: { id: string; name: string }[]
}

export default function ColorAnalysisPage() {
  const { items, loading } = useWardrobe()

  // Analyze colors in the wardrobe
  const colorAnalysis = useMemo(() => {
    const colorCounts: Record<string, { count: number; items: { id: string; name: string }[] }> = {}

    items.forEach(item => {
      if (item.color) {
        const colorLower = item.color.toLowerCase()
        if (!colorCounts[colorLower]) {
          colorCounts[colorLower] = { count: 0, items: [] }
        }
        colorCounts[colorLower].count++
        colorCounts[colorLower].items.push({ id: item.id, name: item.name })
      }
    })

    const totalWithColor = items.filter(i => i.color).length

    const colorData: ColorData[] = Object.entries(colorCounts)
      .map(([name, data]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count: data.count,
        percentage: totalWithColor > 0 ? (data.count / totalWithColor) * 100 : 0,
        hex: COLOR_MAP[name] || '#9ca3af',
        items: data.items
      }))
      .sort((a, b) => b.count - a.count)

    return {
      colors: colorData,
      totalItems: items.length,
      itemsWithColor: totalWithColor,
      itemsWithoutColor: items.length - totalWithColor,
      dominantColors: colorData.slice(0, 5),
      missingColors: getMissingColors(colorData)
    }
  }, [items])

  // Suggest colors that are missing from the wardrobe
  function getMissingColors(existingColors: ColorData[]): string[] {
    const essentialColors = ['black', 'white', 'navy', 'gray', 'beige']
    const existingNames = existingColors.map(c => c.name.toLowerCase())
    return essentialColors.filter(c => !existingNames.includes(c))
  }

  // Color harmony suggestions
  const colorHarmony = useMemo(() => {
    const suggestions: string[] = []
    const colorNames = colorAnalysis.colors.map(c => c.name.toLowerCase())

    // Check for neutrals
    const hasNeutrals = colorNames.some(c =>
      ['black', 'white', 'gray', 'grey', 'beige', 'cream', 'tan'].includes(c)
    )
    if (!hasNeutrals) {
      suggestions.push('Consider adding neutral colors (black, white, gray) for versatile outfit combinations.')
    }

    // Check color balance
    const warmColors = colorNames.filter(c =>
      ['red', 'orange', 'yellow', 'coral', 'peach', 'gold', 'burgundy', 'maroon'].includes(c)
    )
    const coolColors = colorNames.filter(c =>
      ['blue', 'green', 'purple', 'teal', 'navy', 'mint', 'lavender'].includes(c)
    )

    if (warmColors.length > 0 && coolColors.length === 0) {
      suggestions.push('Your wardrobe leans warm. Consider adding cool colors like blue or green for balance.')
    } else if (coolColors.length > 0 && warmColors.length === 0) {
      suggestions.push('Your wardrobe leans cool. Consider adding warm colors like coral or burgundy for variety.')
    }

    // Check for variety
    if (colorAnalysis.colors.length < 3 && items.length > 5) {
      suggestions.push('Your wardrobe could use more color variety. Try introducing 2-3 accent colors.')
    }

    return suggestions
  }, [colorAnalysis, items.length])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="lg:pl-64 px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="lg:pl-64">
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Palette className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Color Analysis</h1>
              <p className="text-gray-600">
                Understand the color distribution in your wardrobe
              </p>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="card text-center py-12">
              <Palette className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items yet</h3>
              <p className="text-gray-500 mb-4">
                Add items to your wardrobe to see color analysis.
              </p>
              <Link href="/add-item" className="btn-primary">
                Add Your First Item
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Color Distribution */}
              <div className="lg:col-span-2 card">
                <h2 className="text-lg font-semibold mb-4">Color Distribution</h2>

                {colorAnalysis.itemsWithColor === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      No colors recorded for your items. Edit items to add color information.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {colorAnalysis.colors.map(color => (
                      <div key={color.name} className="group">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full border border-gray-200"
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="font-medium text-gray-900">{color.name}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {color.count} item{color.count !== 1 ? 's' : ''} ({color.percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${color.percentage}%`,
                              backgroundColor: color.hex
                            }}
                          />
                        </div>
                        {/* Show items on hover */}
                        <div className="hidden group-hover:block mt-2 text-xs text-gray-500">
                          {color.items.slice(0, 5).map((item, i) => (
                            <span key={item.id}>
                              <Link href={`/wardrobe/${item.id}`} className="hover:text-wardrobe-600">
                                {item.name}
                              </Link>
                              {i < Math.min(color.items.length, 5) - 1 && ', '}
                            </span>
                          ))}
                          {color.items.length > 5 && ` +${color.items.length - 5} more`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Stats & Suggestions */}
              <div className="space-y-6">
                {/* Overview Stats */}
                <div className="card">
                  <h2 className="text-lg font-semibold mb-4">Overview</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Items</span>
                      <span className="font-medium">{colorAnalysis.totalItems}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items with Color</span>
                      <span className="font-medium">{colorAnalysis.itemsWithColor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unique Colors</span>
                      <span className="font-medium">{colorAnalysis.colors.length}</span>
                    </div>
                    {colorAnalysis.itemsWithoutColor > 0 && (
                      <div className="flex justify-between text-orange-600">
                        <span>Missing Color Data</span>
                        <span className="font-medium">{colorAnalysis.itemsWithoutColor}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dominant Colors */}
                {colorAnalysis.dominantColors.length > 0 && (
                  <div className="card">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-wardrobe-500" />
                      Top Colors
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {colorAnalysis.dominantColors.map((color, index) => (
                        <div
                          key={color.name}
                          className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg"
                        >
                          <span className="text-lg font-semibold text-gray-400">#{index + 1}</span>
                          <div
                            className="w-6 h-6 rounded-full border border-gray-200"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="text-sm font-medium">{color.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {(colorHarmony.length > 0 || colorAnalysis.missingColors.length > 0) && (
                  <div className="card">
                    <h2 className="text-lg font-semibold mb-4">Suggestions</h2>
                    <div className="space-y-3 text-sm">
                      {colorAnalysis.missingColors.length > 0 && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-blue-800">
                            <strong>Essential colors to consider:</strong>{' '}
                            {colorAnalysis.missingColors.map(c =>
                              c.charAt(0).toUpperCase() + c.slice(1)
                            ).join(', ')}
                          </p>
                        </div>
                      )}
                      {colorHarmony.map((suggestion, i) => (
                        <div key={i} className="p-3 bg-orange-50 rounded-lg">
                          <p className="text-orange-800">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Palette Preview */}
                {colorAnalysis.colors.length > 0 && (
                  <div className="card">
                    <h2 className="text-lg font-semibold mb-4">Your Palette</h2>
                    <div className="flex flex-wrap gap-1">
                      {colorAnalysis.colors.map(color => (
                        <div
                          key={color.name}
                          className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer hover:scale-110 transition-transform"
                          style={{ backgroundColor: color.hex }}
                          title={`${color.name}: ${color.count} items`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

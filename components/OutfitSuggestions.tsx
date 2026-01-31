'use client'

import { useMemo } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'
import { ClothingItem } from '@/types/wardrobe'

interface OutfitSuggestion {
  id: string
  name: string
  items: ClothingItem[]
  reason: string
}

interface OutfitSuggestionsProps {
  items: ClothingItem[]
  onSelectSuggestion: (suggestion: OutfitSuggestion) => void
  onRefresh: () => void
}

// Color compatibility groups
const colorGroups: Record<string, string[]> = {
  neutrals: ['Black', 'White', 'Gray', 'Grey', 'Beige', 'Cream', 'Navy', 'Tan', 'Brown'],
  warm: ['Red', 'Orange', 'Yellow', 'Pink', 'Coral', 'Burgundy', 'Maroon'],
  cool: ['Blue', 'Green', 'Purple', 'Teal', 'Cyan', 'Lavender', 'Mint'],
}

function getColorGroup(color: string): string | null {
  const lowerColor = color.toLowerCase()
  for (const [group, colors] of Object.entries(colorGroups)) {
    if (colors.some(c => lowerColor.includes(c.toLowerCase()))) {
      return group
    }
  }
  return null
}

function areColorsCompatible(color1?: string, color2?: string): boolean {
  if (!color1 || !color2) return true // If no color info, assume compatible

  const group1 = getColorGroup(color1)
  const group2 = getColorGroup(color2)

  // Neutrals go with everything
  if (group1 === 'neutrals' || group2 === 'neutrals') return true

  // Same group is compatible
  if (group1 === group2) return true

  // Different non-neutral groups can still work
  return true
}

export default function OutfitSuggestions({ items, onSelectSuggestion, onRefresh }: OutfitSuggestionsProps) {
  const suggestions = useMemo(() => {
    const results: OutfitSuggestion[] = []

    // Group items by category
    const tops = items.filter(i => i.category === 'Tops')
    const bottoms = items.filter(i => i.category === 'Bottoms')
    const outerwear = items.filter(i => i.category === 'Outerwear')
    const shoes = items.filter(i => i.category === 'Shoes')
    const accessories = items.filter(i => i.category === 'Accessories')
    const formalWear = items.filter(i => i.category === 'Formal Wear')
    const activewear = items.filter(i => i.category === 'Activewear')

    // Helper to shuffle and pick random items
    const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5)
    const pickRandom = <T,>(arr: T[], count: number = 1): T[] => shuffle(arr).slice(0, count)

    // 1. Classic Casual: Top + Bottom + Shoes
    if (tops.length > 0 && bottoms.length > 0) {
      const top = pickRandom(tops)[0]
      const compatibleBottoms = bottoms.filter(b => areColorsCompatible(top.color, b.color))
      const bottom = pickRandom(compatibleBottoms.length > 0 ? compatibleBottoms : bottoms)[0]
      const shoe = shoes.length > 0 ? pickRandom(shoes)[0] : null

      results.push({
        id: 'casual-1',
        name: 'Casual Day Out',
        items: [top, bottom, shoe].filter(Boolean) as ClothingItem[],
        reason: 'A comfortable everyday combination'
      })
    }

    // 2. Layered Look: Top + Outerwear + Bottom
    if (tops.length > 0 && outerwear.length > 0 && bottoms.length > 0) {
      const outer = pickRandom(outerwear)[0]
      const top = pickRandom(tops)[0]
      const bottom = pickRandom(bottoms)[0]

      results.push({
        id: 'layered-1',
        name: 'Layered Look',
        items: [top, outer, bottom],
        reason: 'Perfect for changing weather'
      })
    }

    // 3. Monochrome outfit (same color family)
    const coloredItems = items.filter(i => i.color)
    const colorMap: Record<string, ClothingItem[]> = {}
    coloredItems.forEach(item => {
      const group = getColorGroup(item.color!) || 'other'
      if (!colorMap[group]) colorMap[group] = []
      colorMap[group].push(item)
    })

    for (const [group, groupItems] of Object.entries(colorMap)) {
      if (groupItems.length >= 2 && group !== 'other') {
        const selected = pickRandom(groupItems, Math.min(3, groupItems.length))
        if (selected.length >= 2) {
          results.push({
            id: `mono-${group}`,
            name: `${group.charAt(0).toUpperCase() + group.slice(1)} Tones`,
            items: selected,
            reason: `Coordinated ${group} color palette`
          })
          break // Only one monochrome suggestion
        }
      }
    }

    // 4. Formal outfit
    if (formalWear.length > 0) {
      const formal = pickRandom(formalWear, Math.min(2, formalWear.length))
      const formalShoe = shoes.find(s => s.tags.some(t =>
        t.toLowerCase().includes('formal') ||
        t.toLowerCase().includes('dress')
      )) || pickRandom(shoes)[0]

      results.push({
        id: 'formal-1',
        name: 'Formal Occasion',
        items: [...formal, formalShoe].filter(Boolean) as ClothingItem[],
        reason: 'Dressed to impress'
      })
    }

    // 5. Workout outfit
    if (activewear.length >= 2) {
      const workout = pickRandom(activewear, Math.min(3, activewear.length))
      results.push({
        id: 'workout-1',
        name: 'Workout Ready',
        items: workout,
        reason: 'Get moving in comfort'
      })
    }

    // 6. Accessories spotlight
    if (accessories.length > 0 && tops.length > 0) {
      const accessory = pickRandom(accessories)[0]
      const top = pickRandom(tops)[0]
      const bottom = bottoms.length > 0 ? pickRandom(bottoms)[0] : null

      results.push({
        id: 'accessorized-1',
        name: 'Accessorized',
        items: [top, bottom, accessory].filter(Boolean) as ClothingItem[],
        reason: `Featuring your ${accessory.name}`
      })
    }

    // 7. Most worn favorites
    const favorites = items.filter(i => i.isFavorite)
    if (favorites.length >= 2) {
      const favItems = pickRandom(favorites, Math.min(3, favorites.length))
      results.push({
        id: 'favorites-1',
        name: 'Favorites Combo',
        items: favItems,
        reason: 'Your most-loved pieces together'
      })
    }

    return shuffle(results).slice(0, 4) // Return up to 4 random suggestions
  }, [items])

  if (items.length < 2) {
    return (
      <div className="bg-gradient-to-r from-wardrobe-50 to-purple-50 rounded-lg p-6 text-center">
        <Sparkles className="h-8 w-8 text-wardrobe-400 mx-auto mb-2" />
        <h3 className="font-medium text-gray-900">Add more items for suggestions</h3>
        <p className="text-sm text-gray-600 mt-1">
          We need at least 2 items to suggest outfit combinations
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-wardrobe-50 to-purple-50 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-wardrobe-600" />
          <h3 className="font-semibold text-gray-900">Outfit Ideas</h3>
        </div>
        <button
          onClick={onRefresh}
          className="text-sm text-wardrobe-600 hover:text-wardrobe-700 flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          New ideas
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {suggestions.map(suggestion => (
          <button
            key={suggestion.id}
            onClick={() => onSelectSuggestion(suggestion)}
            className="bg-white rounded-lg p-3 text-left hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex gap-1 mb-2">
              {suggestion.items.slice(0, 3).map((item, i) => (
                <div key={item.id} className="w-12 h-12 rounded overflow-hidden bg-gray-200 flex-shrink-0">
                  {item.images?.[0] ? (
                    <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg">👕</div>
                  )}
                </div>
              ))}
              {suggestion.items.length > 3 && (
                <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                  +{suggestion.items.length - 3}
                </div>
              )}
            </div>
            <h4 className="font-medium text-gray-900 text-sm">{suggestion.name}</h4>
            <p className="text-xs text-gray-500 mt-0.5">{suggestion.reason}</p>
          </button>
        ))}
      </div>

      {suggestions.length === 0 && (
        <p className="text-center text-gray-500 py-4">
          Add more variety to your wardrobe for better suggestions
        </p>
      )}
    </div>
  )
}

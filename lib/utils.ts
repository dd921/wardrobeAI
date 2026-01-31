import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
  return `${Math.floor(diffInDays / 365)} years ago`
}

export function generateId(): string {
  // Generate a valid UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export function getTagColorClass(category: string): string {
  const colorMap: Record<string, string> = {
    'Color': 'tag-color',
    'Season': 'tag-season',
    'Occasion': 'tag-occasion',
    'Style': 'tag-style',
    'Material': 'tag-material',
    'Fit': 'tag-fit',
    'Brand': 'tag-brand',
    'Custom': 'tag-custom',
  }
  
  return colorMap[category] || 'tag-custom'
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Shared color map for clothing colors - used by color-analysis and imageSimilarity
// Expanded palette with 55+ fashion colors for better color matching
export const COLOR_MAP: Record<string, string> = {
  // Neutrals
  'black': '#1a1a1a',
  'charcoal': '#36454f',
  'slate': '#708090',
  'gray': '#6b7280',
  'grey': '#6b7280',
  'silver': '#c0c0c0',
  'white': '#f5f5f5',
  'ivory': '#fffff0',
  'cream': '#fffdd0',
  'off-white': '#faf0e6',

  // Browns & Tans
  'espresso': '#3c2415',
  'chocolate': '#4a2c2a',
  'brown': '#6b4423',
  'cognac': '#9a463d',
  'rust': '#b7410e',
  'caramel': '#a67b5b',
  'tan': '#d2b48c',
  'beige': '#d4c4a8',
  'sand': '#c2b280',
  'khaki': '#c3b091',
  'taupe': '#483c32',

  // Reds & Pinks
  'burgundy': '#722f37',
  'maroon': '#800000',
  'wine': '#722f37',
  'red': '#ef4444',
  'cherry': '#de3163',
  'coral': '#ff7f50',
  'salmon': '#fa8072',
  'blush': '#de5d83',
  'pink': '#ec4899',
  'rose': '#ff007f',
  'dusty-rose': '#c4a4a4',
  'mauve': '#e0b0ff',
  'peach': '#ffcba4',

  // Oranges & Yellows
  'burnt-orange': '#cc5500',
  'orange': '#f97316',
  'tangerine': '#ff9966',
  'mustard': '#ffdb58',
  'gold': '#ffd700',
  'yellow': '#eab308',
  'lemon': '#fff44f',

  // Greens
  'forest': '#228b22',
  'hunter': '#355e3b',
  'olive': '#6b7f59',
  'sage': '#9dc183',
  'green': '#22c55e',
  'emerald': '#50c878',
  'mint': '#98ff98',
  'seafoam': '#93e9be',
  'teal': '#14b8a6',
  'turquoise': '#40e0d0',

  // Blues
  'navy': '#1e3a5f',
  'midnight': '#191970',
  'royal': '#4169e1',
  'blue': '#3b82f6',
  'cobalt': '#0047ab',
  'denim': '#1560bd',
  'steel': '#4682b4',
  'sky': '#87ceeb',
  'powder-blue': '#b0e0e6',
  'baby-blue': '#89cff0',
  'ice-blue': '#d6ecef',

  // Purples
  'plum': '#8e4585',
  'eggplant': '#614051',
  'purple': '#a855f7',
  'violet': '#8b5cf6',
  'lilac': '#c8a2c8',
  'lavender': '#e6e6fa',
  'periwinkle': '#ccccff',
}




import { supabase } from './supabase'
import { ClothingItem, Tag, Outfit, ClothingCategory, TagCategory } from '@/types/wardrobe'
import { generateId } from './utils'

// Helper function to get current user ID (for now, using a mock user)
export const getCurrentUserId = () => {
  // In a real app, this would come from authentication
  return '00000000-0000-0000-0000-000000000000'
}

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && 
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
         process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url'
}

// Mock data for when Supabase isn't configured
const mockItems: ClothingItem[] = [
  {
    id: '1',
    name: 'Blue Denim Jacket',
    description: 'Classic denim jacket perfect for layering',
    category: 'Outerwear',
    tags: ['Blue', 'Denim', 'Casual', 'Spring'],
    images: ['/api/placeholder/300/400'],
    brand: 'Levi\'s',
    size: 'M',
    color: 'Blue',
    material: 'Denim',
    purchaseDate: new Date('2023-09-15'),
    price: 89.99,
    careInstructions: 'Machine wash cold, tumble dry low',
    lastWorn: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    wearCount: 15,
    isFavorite: true,
    createdAt: new Date('2023-09-15'),
    updatedAt: new Date('2023-09-15')
  },
  {
    id: '2',
    name: 'White Cotton T-Shirt',
    description: 'Essential white t-shirt for everyday wear',
    category: 'Tops',
    tags: ['White', 'Cotton', 'Basic', 'Summer'],
    images: ['/api/placeholder/300/400'],
    brand: 'Hanes',
    size: 'L',
    color: 'White',
    material: 'Cotton',
    purchaseDate: new Date('2023-06-20'),
    price: 12.99,
    careInstructions: 'Machine wash warm',
    lastWorn: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    wearCount: 28,
    isFavorite: false,
    createdAt: new Date('2023-06-20'),
    updatedAt: new Date('2023-06-20')
  }
]

// Clothing Items
export const getClothingItems = async (): Promise<ClothingItem[]> => {
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured, using mock data')
    return mockItems
  }

  const { data, error } = await supabase
    .from('clothing_items')
    .select(`
      *,
      item_tags (
        tags (*)
      )
    `)
    .eq('user_id', getCurrentUserId())
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching clothing items:', error)
    return mockItems // Fallback to mock data
  }

  return data?.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description || undefined,
    category: item.category as ClothingCategory,
    tags: item.item_tags?.map((it: any) => it.tags.name) || [],
    images: [], // TODO: Implement image storage
    brand: item.brand || undefined,
    size: item.size || undefined,
    color: item.color || undefined,
    material: item.material || undefined,
    purchaseDate: item.purchase_date ? new Date(item.purchase_date) : undefined,
    price: item.price || undefined,
    careInstructions: item.care_instructions || undefined,
    lastWorn: item.last_worn ? new Date(item.last_worn) : undefined,
    wearCount: item.wear_count,
    isFavorite: item.is_favorite,
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at)
  })) || []
}

export const addClothingItem = async (itemData: Omit<ClothingItem, 'id' | 'createdAt' | 'updatedAt' | 'wearCount'>): Promise<ClothingItem | null> => {
  console.log('addClothingItem called with:', itemData)
  
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured, simulating item addition')
    // Simulate adding to mock data
    const newItem: ClothingItem = {
      id: generateId(),
      ...itemData,
      wearCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    mockItems.unshift(newItem) // Add to beginning of array
    console.log('Mock item added:', newItem)
    return newItem
  }

  console.log('Using Supabase for item addition')
  const userId = getCurrentUserId()
  const now = new Date().toISOString()

  // Insert the clothing item
  const { data: item, error: itemError } = await supabase
    .from('clothing_items')
    .insert({
      id: generateId(),
      name: itemData.name,
      description: itemData.description || null,
      category: itemData.category,
      brand: itemData.brand || null,
      size: itemData.size || null,
      color: itemData.color || null,
      material: itemData.material || null,
      price: itemData.price || null,
      care_instructions: itemData.careInstructions || null,
      purchase_date: itemData.purchaseDate?.toISOString() || null,
      last_worn: itemData.lastWorn?.toISOString() || null,
      wear_count: 0,
      is_favorite: itemData.isFavorite || false,
      created_at: now,
      updated_at: now,
      user_id: userId
    })
    .select()
    .single()

  if (itemError) {
    console.error('Error adding clothing item:', itemError)
    return null
  }

  console.log('Item inserted successfully:', item)

  // Add tags if provided
  if (itemData.tags && itemData.tags.length > 0) {
    console.log('Adding tags:', itemData.tags)
    await addTagsToItem(item.id, itemData.tags)
  }

  const result = {
    id: item.id,
    name: item.name,
    description: item.description || undefined,
    category: item.category as ClothingCategory,
    tags: itemData.tags || [],
    images: itemData.images || [],
    brand: item.brand || undefined,
    size: item.size || undefined,
    color: item.color || undefined,
    material: item.material || undefined,
    purchaseDate: item.purchase_date ? new Date(item.purchase_date) : undefined,
    price: item.price || undefined,
    careInstructions: item.care_instructions || undefined,
    lastWorn: item.last_worn ? new Date(item.last_worn) : undefined,
    wearCount: item.wear_count,
    isFavorite: item.is_favorite,
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at)
  }

  console.log('Returning result:', result)
  return result
}

export const updateClothingItem = async (id: string, updates: Partial<ClothingItem>): Promise<ClothingItem | null> => {
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured, simulating item update')
    const itemIndex = mockItems.findIndex(item => item.id === id)
    if (itemIndex !== -1) {
      mockItems[itemIndex] = { ...mockItems[itemIndex], ...updates, updatedAt: new Date() }
      return mockItems[itemIndex]
    }
    return null
  }

  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('clothing_items')
    .update({
      name: updates.name,
      description: updates.description || null,
      category: updates.category,
      brand: updates.brand || null,
      size: updates.size || null,
      color: updates.color || null,
      material: updates.material || null,
      price: updates.price || null,
      care_instructions: updates.careInstructions || null,
      purchase_date: updates.purchaseDate?.toISOString() || null,
      last_worn: updates.lastWorn?.toISOString() || null,
      wear_count: updates.wearCount,
      is_favorite: updates.isFavorite,
      updated_at: now
    })
    .eq('id', id)
    .eq('user_id', getCurrentUserId())
    .select()
    .single()

  if (error) {
    console.error('Error updating clothing item:', error)
    return null
  }

  // Update tags if provided
  if (updates.tags) {
    // Remove existing tags
    await supabase
      .from('item_tags')
      .delete()
      .eq('item_id', id)

    // Add new tags
    if (updates.tags.length > 0) {
      await addTagsToItem(id, updates.tags)
    }
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description || undefined,
    category: data.category as ClothingCategory,
    tags: updates.tags || [],
    images: updates.images || [],
    brand: data.brand || undefined,
    size: data.size || undefined,
    color: data.color || undefined,
    material: data.material || undefined,
    purchaseDate: data.purchase_date ? new Date(data.purchase_date) : undefined,
    price: data.price || undefined,
    careInstructions: data.care_instructions || undefined,
    lastWorn: data.last_worn ? new Date(data.last_worn) : undefined,
    wearCount: data.wear_count,
    isFavorite: data.is_favorite,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  }
}

export const deleteClothingItem = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured, simulating item deletion')
    const itemIndex = mockItems.findIndex(item => item.id === id)
    if (itemIndex !== -1) {
      mockItems.splice(itemIndex, 1)
      return true
    }
    return false
  }

  // Delete associated tags first
  await supabase
    .from('item_tags')
    .delete()
    .eq('item_id', id)

  // Delete the item
  const { error } = await supabase
    .from('clothing_items')
    .delete()
    .eq('id', id)
    .eq('user_id', getCurrentUserId())

  if (error) {
    console.error('Error deleting clothing item:', error)
    return false
  }

  return true
}

// Tags
export const getTags = async (): Promise<Tag[]> => {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('user_id', getCurrentUserId())
    .order('usage_count', { ascending: false })

  if (error) {
    console.error('Error fetching tags:', error)
    return []
  }

  return data?.map(tag => ({
    id: tag.id,
    name: tag.name,
    color: tag.color,
    category: tag.category as TagCategory,
    usageCount: tag.usage_count,
    createdAt: new Date(tag.created_at)
  })) || []
}

export const addTag = async (tagData: Omit<Tag, 'id' | 'createdAt' | 'usageCount'>): Promise<Tag | null> => {
  const userId = getCurrentUserId()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('tags')
    .insert({
      id: generateId(),
      name: tagData.name,
      color: tagData.color,
      category: tagData.category,
      usage_count: 0,
      created_at: now,
      user_id: userId
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding tag:', error)
    return null
  }

  return {
    id: data.id,
    name: data.name,
    color: data.color,
    category: data.category as TagCategory,
    usageCount: data.usage_count,
    createdAt: new Date(data.created_at)
  }
}

// Helper function to add tags to an item
const addTagsToItem = async (itemId: string, tagNames: string[]): Promise<void> => {
  const userId = getCurrentUserId()

  for (const tagName of tagNames) {
    // Check if tag exists, create if not
    let { data: existingTag } = await supabase
      .from('tags')
      .select('id')
      .eq('name', tagName)
      .eq('user_id', userId)
      .single()

    if (!existingTag) {
      // Create new tag
      const { data: newTag } = await supabase
        .from('tags')
        .insert({
          id: generateId(),
          name: tagName,
          color: '#3B82F6', // Default blue color
          category: 'Custom',
          usage_count: 1,
          created_at: new Date().toISOString(),
          user_id: userId
        })
        .select()
        .single()

      existingTag = newTag
    } else {
      // Increment usage count
      await supabase
        .from('tags')
        .update({ usage_count: supabase.raw('usage_count + 1') })
        .eq('id', existingTag.id)
    }

    // Link tag to item
    await supabase
      .from('item_tags')
      .insert({
        id: generateId(),
        item_id: itemId,
        tag_id: existingTag.id,
        created_at: new Date().toISOString()
      })
  }
}

// Outfits
export const getOutfits = async (): Promise<Outfit[]> => {
  const { data, error } = await supabase
    .from('outfits')
    .select(`
      *,
      outfit_items (
        clothing_items (*)
      ),
      outfit_tags (
        tags (*)
      )
    `)
    .eq('user_id', getCurrentUserId())
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching outfits:', error)
    return []
  }

  return data?.map(outfit => ({
    id: outfit.id,
    name: outfit.name,
    description: outfit.description || undefined,
    items: outfit.outfit_items?.map((oi: any) => oi.clothing_items.id) || [],
    tags: outfit.outfit_tags?.map((ot: any) => ot.tags.name) || [],
    isFavorite: outfit.is_favorite,
    createdAt: new Date(outfit.created_at),
    updatedAt: new Date(outfit.updated_at)
  })) || []
}

export const addOutfit = async (outfitData: Omit<Outfit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Outfit | null> => {
  const userId = getCurrentUserId()
  const now = new Date().toISOString()

  const { data: outfit, error: outfitError } = await supabase
    .from('outfits')
    .insert({
      id: generateId(),
      name: outfitData.name,
      description: outfitData.description || null,
      is_favorite: outfitData.isFavorite,
      created_at: now,
      updated_at: now,
      user_id: userId
    })
    .select()
    .single()

  if (outfitError) {
    console.error('Error adding outfit:', outfitError)
    return null
  }

  // Add items to outfit
  if (outfitData.items && outfitData.items.length > 0) {
    for (const itemId of outfitData.items) {
      await supabase
        .from('outfit_items')
        .insert({
          id: generateId(),
          outfit_id: outfit.id,
          item_id: itemId,
          created_at: now
        })
    }
  }

  // Add tags to outfit
  if (outfitData.tags && outfitData.tags.length > 0) {
    for (const tagName of outfitData.tags) {
      // Get or create tag
      let { data: tag } = await supabase
        .from('tags')
        .select('id')
        .eq('name', tagName)
        .eq('user_id', userId)
        .single()

      if (!tag) {
        const { data: newTag } = await supabase
          .from('tags')
          .insert({
            id: generateId(),
            name: tagName,
            color: '#3B82F6',
            category: 'Custom',
            usage_count: 1,
            created_at: now,
            user_id: userId
          })
          .select()
          .single()

        tag = newTag
      }

      await supabase
        .from('outfit_tags')
        .insert({
          id: generateId(),
          outfit_id: outfit.id,
          tag_id: tag.id,
          created_at: now
        })
    }
  }

  return {
    id: outfit.id,
    name: outfit.name,
    description: outfit.description || undefined,
    items: outfitData.items || [],
    tags: outfitData.tags || [],
    isFavorite: outfit.is_favorite,
    createdAt: new Date(outfit.created_at),
    updatedAt: new Date(outfit.updated_at)
  }
}

// Statistics
export const getWardrobeStats = async () => {
  const items = await getClothingItems()
  
  const totalItems = items.length
  const totalValue = items.reduce((sum, item) => sum + (item.price || 0), 0)
  const favoriteItems = items.filter(item => item.isFavorite).length
  const recentItems = items.filter(item => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return item.createdAt > weekAgo
  }).length

  // Category breakdown
  const categoryBreakdown = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Most worn items
  const mostWorn = items
    .sort((a, b) => b.wearCount - a.wearCount)
    .slice(0, 5)

  return {
    totalItems,
    totalValue,
    favoriteItems,
    recentItems,
    categoryBreakdown,
    mostWorn
  }
}

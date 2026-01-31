export interface ClothingItem {
  id: string;
  name: string;
  description?: string;
  category: ClothingCategory;
  tags: string[];
  images: string[];
  brand?: string;
  size?: string;
  color?: string;
  material?: string;
  purchaseDate?: Date;
  price?: number;
  careInstructions?: string;
  lastWorn?: Date;
  wearCount: number;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ClothingCategory = 
  | 'Tops'
  | 'Bottoms'
  | 'Outerwear'
  | 'Shoes'
  | 'Accessories'
  | 'Undergarments'
  | 'Sleepwear'
  | 'Activewear'
  | 'Formal Wear'
  | 'Swimwear'
  | 'Loungewear'
  | 'Other';

export interface Tag {
  id: string;
  name: string;
  color: string;
  category: TagCategory;
  usageCount: number;
  createdAt: Date;
}

export type TagCategory = 
  | 'Color'
  | 'Season'
  | 'Occasion'
  | 'Style'
  | 'Material'
  | 'Fit'
  | 'Brand'
  | 'Custom';

export interface Outfit {
  id: string;
  name: string;
  description?: string;
  items: string[]; // Array of ClothingItem IDs
  tags: string[];
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WardrobeStats {
  totalItems: number;
  totalValue: number;
  favoriteItems: number;
  recentItems: number;
  categoryBreakdown: Record<string, number>;
  mostWorn: ClothingItem[];
}

export interface SearchFilters {
  category?: ClothingCategory;
  tags?: string[];
  colors?: string[];
  seasons?: string[];
  occasions?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  brand?: string;
  size?: string;
  material?: string;
  isFavorite?: boolean;
  lastWorn?: {
    from: Date;
    to: Date;
  };
}

export interface SortOption {
  field: 'name' | 'category' | 'dateAdded' | 'lastWorn' | 'wearCount' | 'price' | 'brand';
  direction: 'asc' | 'desc';
}

export interface BulkOperation {
  type: 'delete' | 'update' | 'addTags' | 'removeTags' | 'moveCategory';
  itemIds: string[];
  data?: Partial<ClothingItem> | string[]; // For updates or tag operations
}




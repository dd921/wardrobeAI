import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      clothing_items: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string
          brand: string | null
          size: string | null
          color: string | null
          material: string | null
          price: number | null
          care_instructions: string | null
          purchase_date: string | null
          last_worn: string | null
          wear_count: number
          is_favorite: boolean
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: string
          brand?: string | null
          size?: string | null
          color?: string | null
          material?: string | null
          price?: number | null
          care_instructions?: string | null
          purchase_date?: string | null
          last_worn?: string | null
          wear_count?: number
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          brand?: string | null
          size?: string | null
          color?: string | null
          material?: string | null
          price?: number | null
          care_instructions?: string | null
          purchase_date?: string | null
          last_worn?: string | null
          wear_count?: number
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          color: string
          category: string
          usage_count: number
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          category: string
          usage_count?: number
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          category?: string
          usage_count?: number
          created_at?: string
          user_id?: string
        }
      }
      item_tags: {
        Row: {
          id: string
          item_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          id?: string
          item_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          tag_id?: string
          created_at?: string
        }
      }
      outfits: {
        Row: {
          id: string
          name: string
          description: string | null
          is_favorite: boolean
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      outfit_items: {
        Row: {
          id: string
          outfit_id: string
          item_id: string
          created_at: string
        }
        Insert: {
          id?: string
          outfit_id: string
          item_id: string
          created_at?: string
        }
        Update: {
          id?: string
          outfit_id?: string
          item_id?: string
          created_at?: string
        }
      }
      outfit_tags: {
        Row: {
          id: string
          outfit_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          id?: string
          outfit_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          id?: string
          outfit_id?: string
          tag_id?: string
          created_at?: string
        }
      }
    }
  }
}



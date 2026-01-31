-- Wardrobe AI Database Schema
-- Run this SQL in your Supabase SQL editor to create the database tables

-- Create clothing_items table
CREATE TABLE IF NOT EXISTS clothing_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories', 
        'Undergarments', 'Sleepwear', 'Activewear', 'Formal Wear', 
        'Swimwear', 'Loungewear', 'Other'
    )),
    brand VARCHAR(100),
    size VARCHAR(20),
    color VARCHAR(50),
    material VARCHAR(100),
    price DECIMAL(10,2),
    care_instructions TEXT,
    purchase_date DATE,
    last_worn TIMESTAMP WITH TIME ZONE,
    wear_count INTEGER DEFAULT 0,
    is_favorite BOOLEAN DEFAULT FALSE,
    image_urls TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'Color', 'Season', 'Occasion', 'Style', 'Material', 
        'Fit', 'Brand', 'Custom'
    )),
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL,
    UNIQUE(name, user_id)
);

-- Create item_tags junction table
CREATE TABLE IF NOT EXISTS item_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES clothing_items(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(item_id, tag_id)
);

-- Create outfits table
CREATE TABLE IF NOT EXISTS outfits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL
);

-- Create outfit_items junction table
CREATE TABLE IF NOT EXISTS outfit_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES clothing_items(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(outfit_id, item_id)
);

-- Create outfit_tags junction table
CREATE TABLE IF NOT EXISTS outfit_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(outfit_id, tag_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clothing_items_user_id ON clothing_items(user_id);
CREATE INDEX IF NOT EXISTS idx_clothing_items_category ON clothing_items(category);
CREATE INDEX IF NOT EXISTS idx_clothing_items_created_at ON clothing_items(created_at);
CREATE INDEX IF NOT EXISTS idx_clothing_items_is_favorite ON clothing_items(is_favorite);

CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_category ON tags(category);
CREATE INDEX IF NOT EXISTS idx_tags_usage_count ON tags(usage_count);

CREATE INDEX IF NOT EXISTS idx_item_tags_item_id ON item_tags(item_id);
CREATE INDEX IF NOT EXISTS idx_item_tags_tag_id ON item_tags(tag_id);

CREATE INDEX IF NOT EXISTS idx_outfits_user_id ON outfits(user_id);
CREATE INDEX IF NOT EXISTS idx_outfits_created_at ON outfits(created_at);
CREATE INDEX IF NOT EXISTS idx_outfits_is_favorite ON outfits(is_favorite);

CREATE INDEX IF NOT EXISTS idx_outfit_items_outfit_id ON outfit_items(outfit_id);
CREATE INDEX IF NOT EXISTS idx_outfit_items_item_id ON outfit_items(item_id);

CREATE INDEX IF NOT EXISTS idx_outfit_tags_outfit_id ON outfit_tags(outfit_id);
CREATE INDEX IF NOT EXISTS idx_outfit_tags_tag_id ON outfit_tags(tag_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_clothing_items_updated_at 
    BEFORE UPDATE ON clothing_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outfits_updated_at 
    BEFORE UPDATE ON outfits 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE clothing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_tags ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for migration)
DROP POLICY IF EXISTS "Users can view their own clothing items" ON clothing_items;
DROP POLICY IF EXISTS "Users can insert their own clothing items" ON clothing_items;
DROP POLICY IF EXISTS "Users can update their own clothing items" ON clothing_items;
DROP POLICY IF EXISTS "Users can delete their own clothing items" ON clothing_items;
DROP POLICY IF EXISTS "Users can view their own tags" ON tags;
DROP POLICY IF EXISTS "Users can insert their own tags" ON tags;
DROP POLICY IF EXISTS "Users can update their own tags" ON tags;
DROP POLICY IF EXISTS "Users can delete their own tags" ON tags;
DROP POLICY IF EXISTS "Users can view item tags" ON item_tags;
DROP POLICY IF EXISTS "Users can insert item tags" ON item_tags;
DROP POLICY IF EXISTS "Users can delete item tags" ON item_tags;
DROP POLICY IF EXISTS "Users can view their own outfits" ON outfits;
DROP POLICY IF EXISTS "Users can insert their own outfits" ON outfits;
DROP POLICY IF EXISTS "Users can update their own outfits" ON outfits;
DROP POLICY IF EXISTS "Users can delete their own outfits" ON outfits;
DROP POLICY IF EXISTS "Users can view outfit items" ON outfit_items;
DROP POLICY IF EXISTS "Users can insert outfit items" ON outfit_items;
DROP POLICY IF EXISTS "Users can delete outfit items" ON outfit_items;
DROP POLICY IF EXISTS "Users can view outfit tags" ON outfit_tags;
DROP POLICY IF EXISTS "Users can insert outfit tags" ON outfit_tags;
DROP POLICY IF EXISTS "Users can delete outfit tags" ON outfit_tags;

-- Clothing items policies (using auth.uid() for real authentication)
CREATE POLICY "Users can view their own clothing items" ON clothing_items
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own clothing items" ON clothing_items
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own clothing items" ON clothing_items
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own clothing items" ON clothing_items
    FOR DELETE USING (user_id = auth.uid());

-- Tags policies
CREATE POLICY "Users can view their own tags" ON tags
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own tags" ON tags
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tags" ON tags
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own tags" ON tags
    FOR DELETE USING (user_id = auth.uid());

-- Item tags policies
CREATE POLICY "Users can view item tags" ON item_tags
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clothing_items
            WHERE clothing_items.id = item_tags.item_id
            AND clothing_items.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert item tags" ON item_tags
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM clothing_items
            WHERE clothing_items.id = item_tags.item_id
            AND clothing_items.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete item tags" ON item_tags
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM clothing_items
            WHERE clothing_items.id = item_tags.item_id
            AND clothing_items.user_id = auth.uid()
        )
    );

-- Outfits policies
CREATE POLICY "Users can view their own outfits" ON outfits
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own outfits" ON outfits
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own outfits" ON outfits
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own outfits" ON outfits
    FOR DELETE USING (user_id = auth.uid());

-- Outfit items policies
CREATE POLICY "Users can view outfit items" ON outfit_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM outfits
            WHERE outfits.id = outfit_items.outfit_id
            AND outfits.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert outfit items" ON outfit_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM outfits
            WHERE outfits.id = outfit_items.outfit_id
            AND outfits.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete outfit items" ON outfit_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM outfits
            WHERE outfits.id = outfit_items.outfit_id
            AND outfits.user_id = auth.uid()
        )
    );

-- Outfit tags policies
CREATE POLICY "Users can view outfit tags" ON outfit_tags
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM outfits
            WHERE outfits.id = outfit_tags.outfit_id
            AND outfits.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert outfit tags" ON outfit_tags
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM outfits
            WHERE outfits.id = outfit_tags.outfit_id
            AND outfits.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete outfit tags" ON outfit_tags
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM outfits
            WHERE outfits.id = outfit_tags.outfit_id
            AND outfits.user_id = auth.uid()
        )
    );


-- Seed Sample Items for New Users
-- Run this in your Supabase SQL Editor to automatically create sample items for new users

-- Function to create sample items for a new user
CREATE OR REPLACE FUNCTION create_sample_items_for_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Sample Top: Classic White Oxford Shirt
  INSERT INTO clothing_items (
    id,
    name,
    description,
    category,
    brand,
    size,
    color,
    material,
    price,
    care_instructions,
    purchase_date,
    wear_count,
    is_favorite,
    image_urls,
    user_id,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    'Classic White Oxford Shirt',
    'A timeless wardrobe essential. This crisp white oxford shirt works for both casual and semi-formal occasions. Features a button-down collar and a slightly relaxed fit for all-day comfort.',
    'Tops',
    'Brooks Brothers',
    'M',
    'White',
    '100% Cotton Oxford',
    89.99,
    'Machine wash cold with like colors. Tumble dry low. Warm iron if needed. Do not bleach.',
    CURRENT_DATE - INTERVAL '3 months',
    12,
    true,
    ARRAY[]::text[],
    NEW.id,
    NOW(),
    NOW()
  );

  -- Sample Bottom: Navy Chino Pants
  INSERT INTO clothing_items (
    id,
    name,
    description,
    category,
    brand,
    size,
    color,
    material,
    price,
    care_instructions,
    purchase_date,
    wear_count,
    is_favorite,
    image_urls,
    user_id,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    'Navy Chino Pants',
    'Versatile slim-fit chinos in classic navy. Perfect for the office, weekend outings, or date night. Features a comfortable stretch fabric and modern tapered leg.',
    'Bottoms',
    'Bonobos',
    '32x32',
    'Navy',
    '98% Cotton, 2% Elastane',
    98.00,
    'Machine wash cold. Hang dry or tumble dry low. Do not iron directly on fabric.',
    CURRENT_DATE - INTERVAL '2 months',
    8,
    true,
    ARRAY[]::text[],
    NEW.id,
    NOW(),
    NOW()
  );

  -- Create sample tags for the user
  INSERT INTO tags (id, name, color, category, usage_count, user_id, created_at)
  VALUES
    (gen_random_uuid(), 'Work', '#3B82F6', 'Occasion', 2, NEW.id, NOW()),
    (gen_random_uuid(), 'Casual', '#10B981', 'Style', 2, NEW.id, NOW()),
    (gen_random_uuid(), 'Classic', '#8B5CF6', 'Style', 2, NEW.id, NOW());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run after a new user is created
-- This triggers when a user confirms their email (or signs up if email confirmation is disabled)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_sample_items_for_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;

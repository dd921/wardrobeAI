# WardrobeAI

A modern web application for organizing, cataloging, and managing your personal clothing collection. Built with Next.js 14, React 18, TypeScript, and Supabase.

## Features

### Implemented
- **Clothing Catalog**: Add, edit, view, and delete clothing items with detailed metadata
- **Image Upload**: Drag-and-drop photo upload with automatic resizing and Supabase Storage integration
- **Tagging System**: Categorize items with customizable tags (color, season, occasion, style, etc.)
- **Dashboard**: Overview with statistics, category breakdown, and recent items
- **Statistics Page**: View wardrobe analytics including total value, most worn items, and category distribution
- **Responsive Design**: Mobile-friendly interface with sidebar navigation
- **Favorites**: Mark and filter favorite items
- **Search & Browse**: Grid view of all wardrobe items with hover actions

### Placeholder/Coming Soon
- Outfit creation and management
- Tag management page
- Settings page
- User authentication

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS with custom theme
- **Forms**: React Hook Form + Zod validation
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage for images
- **UI Components**: Lucide React icons, Framer Motion, React Hot Toast

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works)

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd wardrobeAI
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned

### 3. Set Up Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `database/schema.sql` and run it
3. This creates the required tables: `clothing_items`, `tags`, `item_tags`, `outfits`, `outfit_items`, `outfit_tags`

### 4. Set Up Storage

1. In Supabase, go to **Storage**
2. Create a new bucket called `wardrobe-images`
3. Make the bucket **public** (for image URLs to work)
4. Add RLS policies for the bucket:

```sql
-- Allow public read access
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'wardrobe-images');

-- Allow authenticated inserts
CREATE POLICY "Allow Uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'wardrobe-images');

-- Allow authenticated deletes
CREATE POLICY "Allow Deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'wardrobe-images');
```

### 5. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these values in your Supabase dashboard under **Settings > API**.

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### Adding Items

1. Click **Add Item** from the navigation or dashboard
2. Upload photos by dragging and dropping or clicking the upload area
3. Fill in the item details (name and category are required)
4. Add tags from suggestions or create custom tags
5. Click **Add Item** to save

### Managing Your Wardrobe

- **View all items**: Navigate to the Wardrobe page
- **View item details**: Click on any item or hover and click the eye icon
- **Edit an item**: Hover over an item and click the edit icon, or click Edit from the detail page
- **Delete an item**: Hover over an item and click the trash icon
- **Favorite an item**: Click the heart icon on any item

### Dashboard

The dashboard shows:
- Total items in your wardrobe
- Total wardrobe value
- Most worn items
- Recently added items
- Category breakdown chart
- Quick action buttons

## Project Structure

```
wardrobeAI/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Dashboard
│   ├── add-item/          # Add new item form
│   ├── wardrobe/          # Wardrobe grid and item detail pages
│   ├── outfits/           # Outfits page (placeholder)
│   ├── tags/              # Tags page (placeholder)
│   ├── stats/             # Statistics page
│   └── settings/          # Settings page (placeholder)
├── components/            # Reusable React components
├── contexts/              # React Context providers
├── lib/                   # Utility functions and database operations
├── types/                 # TypeScript type definitions
├── database/              # SQL schema files
└── public/                # Static assets
```

## Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
npm run type-check # Run TypeScript type checking
```

## Configuration Files

- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS theme customization
- `tsconfig.json` - TypeScript configuration

## Troubleshooting

### Images not uploading
- Verify your Supabase Storage bucket exists and is named `wardrobe-images`
- Check that the bucket is public
- Verify RLS policies are configured correctly
- Check browser console for specific error messages

### Database errors
- Ensure the schema has been applied in Supabase SQL Editor
- Check that your `.env.local` file has the correct Supabase URL and key
- The app will fall back to mock data if Supabase is not configured

### Items not saving
- Check browser console for error messages
- Verify Supabase connection in the Network tab
- Ensure RLS policies allow inserts for the `clothing_items` table

## Development Notes

- The app uses a mock user ID (`00000000-0000-0000-0000-000000000000`) since authentication is not yet implemented
- Mock data is used when Supabase is not configured, allowing local development without a database
- Images are automatically resized to max 1200x1200 before upload to reduce storage usage

## License

MIT

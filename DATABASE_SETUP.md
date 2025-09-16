# Database Setup Guide

This guide will help you set up the Supabase database for the Wardrobe AI application.

## Prerequisites

1. A Supabase account (free tier available at [supabase.com](https://supabase.com))
2. Node.js and npm installed on your system

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `wardrobe-ai` (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the region closest to you
5. Click "Create new project"
6. Wait for the project to be created (usually takes 1-2 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## Step 3: Set Up Environment Variables

1. In your project root, create a `.env.local` file:
   ```bash
   touch .env.local
   ```

2. Add your Supabase credentials to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   **Replace the values with your actual credentials from Step 2.**

## Step 4: Create Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `database/schema.sql` and paste it into the editor
4. Click "Run" to execute the SQL and create all tables

## Step 5: Verify Installation

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:3000`
3. Try adding a new clothing item - it should now be saved to the database!

## Step 6: View Your Data

You can view your data in the Supabase dashboard:

1. Go to **Table Editor** in your Supabase dashboard
2. You should see the following tables:
   - `clothing_items`
   - `tags`
   - `item_tags`
   - `outfits`
   - `outfit_items`
   - `outfit_tags`

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Double-check your `.env.local` file
   - Make sure there are no extra spaces or quotes around the values
   - Restart your development server after making changes

2. **"Table doesn't exist" error**
   - Make sure you ran the SQL schema in Step 4
   - Check that all tables were created successfully

3. **"Row Level Security" errors**
   - The schema includes RLS policies for a mock user
   - In production, you'll need to implement proper authentication

### Getting Help

- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the console logs in your browser's developer tools
- Check the Supabase dashboard logs under **Logs** → **API**

## Next Steps

Once your database is set up:

1. **Add Authentication**: Implement user login/signup
2. **Image Storage**: Set up Supabase Storage for clothing photos
3. **Real-time Updates**: Enable real-time subscriptions for live updates
4. **Deploy**: Deploy your app to Vercel or another platform

## Security Notes

- Never commit your `.env.local` file to version control
- The `anon` key is safe to use in client-side code
- For production, consider implementing proper user authentication
- The current setup uses a mock user ID - replace this with real authentication

## Database Schema Overview

The database includes the following main entities:

- **clothing_items**: Stores individual clothing items
- **tags**: Stores reusable tags for categorization
- **item_tags**: Links clothing items to tags (many-to-many)
- **outfits**: Stores outfit combinations
- **outfit_items**: Links outfits to clothing items
- **outfit_tags**: Links outfits to tags

All tables include proper relationships, indexes for performance, and Row Level Security policies.


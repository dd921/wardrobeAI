# Supabase Storage Setup Guide

This guide will help you set up Supabase Storage for the WardrobeAI application to handle image uploads.

## Prerequisites

1. A Supabase project (already set up from the main database setup)
2. Admin access to your Supabase project

## Step 1: Create Storage Bucket

1. Go to your Supabase dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Configure the bucket:
   - **Name**: `wardrobe-images`
   - **Public bucket**: ✅ **Check this box** (required for public image URLs)
   - **File size limit**: `10MB` (or your preferred limit)
   - **Allowed MIME types**: `image/*` (or leave empty for all types)
5. Click **"Create bucket"**

## Step 2: Configure Storage Policies

After creating the bucket, you need to set up Row Level Security (RLS) policies:

1. In the Storage section, click on your `wardrobe-images` bucket
2. Go to the **"Policies"** tab
3. Click **"New Policy"**

### Policy 1: Allow users to upload images
- **Policy name**: `Users can upload images`
- **Target roles**: `authenticated` (or `anon` if you want to allow anonymous uploads)
- **Policy definition**:
```sql
(user_id()::text = (storage.foldername(name))[1])
```
- **Check expression**:
```sql
bucket_id = 'wardrobe-images'
```

### Policy 2: Allow users to view their own images
- **Policy name**: `Users can view their own images`
- **Target roles**: `authenticated` (or `anon` if you want public access)
- **Policy definition**:
```sql
true
```
- **Check expression**:
```sql
bucket_id = 'wardrobe-images'
```

### Policy 3: Allow users to delete their own images
- **Policy name**: `Users can delete their own images`
- **Target roles**: `authenticated` (or `anon` if you want to allow anonymous deletions)
- **Policy definition**:
```sql
(user_id()::text = (storage.foldername(name))[1])
```
- **Check expression**:
```sql
bucket_id = 'wardrobe-images'
```

## Step 3: Test Storage Setup

1. Go to your app and try adding a new clothing item with images
2. Check the Supabase Storage dashboard to see if images are being uploaded
3. Verify that images are accessible via their public URLs

## Step 4: Optional - Configure CORS (if needed)

If you encounter CORS issues when uploading from the browser:

1. Go to **Settings** → **API** in your Supabase dashboard
2. Scroll down to **CORS Configuration**
3. Add your domain to the allowed origins:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)

## Troubleshooting

### Common Issues

1. **"Bucket not found" error**
   - Make sure the bucket name is exactly `wardrobe-images`
   - Check that the bucket is created and active

2. **"Permission denied" error**
   - Verify that the RLS policies are correctly set up
   - Make sure the bucket is marked as public

3. **"CORS" error**
   - Add your domain to the CORS configuration
   - Check that you're using the correct Supabase URL

4. **Images not displaying**
   - Verify that the bucket is public
   - Check that the image URLs are correctly generated
   - Ensure the images were uploaded successfully

### File Structure

Images will be stored in the following structure:
```
wardrobe-images/
├── {item-id}/
│   ├── {timestamp}-{random}.jpg
│   ├── {timestamp}-{random}.png
│   └── ...
```

This organization makes it easy to:
- Group images by item
- Clean up images when an item is deleted
- Implement user-specific access controls

## Security Notes

- The current setup allows public access to all images
- For production, consider implementing more restrictive policies
- Images are organized by item ID for easier management
- Consider implementing image compression and optimization

## Next Steps

Once storage is set up:

1. **Test the upload functionality** in your app
2. **Implement image deletion** when items are removed
3. **Add image optimization** for better performance
4. **Consider implementing** user authentication for better security

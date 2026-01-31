# Simplified Storage Policies for WardrobeAI

If you're experiencing upload failures, try these simplified storage policies first:

## Step 1: Create the Bucket

1. Go to Supabase Dashboard → Storage
2. Click "New bucket"
3. Name: `wardrobe-images`
4. **Make it PUBLIC** ✅
5. Click "Create bucket"

## Step 2: Add Simple Policies

Go to the bucket → Policies tab and add these policies:

### Policy 1: Allow all uploads (for testing)
- **Policy name**: `Allow all uploads`
- **Target roles**: `anon`
- **Policy definition**: `true`
- **Check expression**: `bucket_id = 'wardrobe-images'`

### Policy 2: Allow all downloads (for testing)
- **Policy name**: `Allow all downloads`
- **Target roles**: `anon`
- **Policy definition**: `true`
- **Check expression**: `bucket_id = 'wardrobe-images'`

### Policy 3: Allow all deletions (for testing)
- **Policy name**: `Allow all deletions`
- **Target roles**: `anon`
- **Policy definition**: `true`
- **Check expression**: `bucket_id = 'wardrobe-images'`

## Step 3: Test the Setup

1. Visit `http://localhost:3000/test-storage`
2. Click "Test Storage Connection"
3. Click "Test Image Upload"
4. Check the results

## Common Issues and Solutions

### Issue: "Bucket not found"
**Solution**: Make sure the bucket name is exactly `wardrobe-images` (case-sensitive)

### Issue: "Permission denied"
**Solution**: 
1. Make sure the bucket is marked as PUBLIC
2. Add the simple policies above
3. Check that you're using the `anon` role in policies

### Issue: "CORS error"
**Solution**:
1. Go to Settings → API
2. Add `http://localhost:3000` to CORS origins
3. Restart your development server

### Issue: "File too large"
**Solution**:
1. Check the bucket's file size limit
2. Make sure it's set to at least 10MB
3. Or reduce the file size limit in the code

## Production Security

For production, replace the simple policies with more restrictive ones:

```sql
-- Allow users to upload their own files
CREATE POLICY "Users can upload own files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'wardrobe-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own files
CREATE POLICY "Users can view own files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'wardrobe-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'wardrobe-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

But for now, use the simple policies to get uploads working first!

# Photo Upload Troubleshooting Guide

If you're getting "upload failed" warnings, follow these steps to diagnose and fix the issue.

## Quick Diagnosis

1. **Visit the diagnostic page**: Go to `http://localhost:3000/test-storage`
2. **Run the tests**: Click both "Test Storage Connection" and "Test Image Upload"
3. **Check the results**: The diagnostic tool will show you exactly what's wrong

## Common Issues & Solutions

### 1. "Bucket not found" Error
**Problem**: The `wardrobe-images` bucket doesn't exist or has a different name.

**Solution**:
1. Go to Supabase Dashboard → Storage
2. Create a new bucket named exactly `wardrobe-images`
3. Make sure it's marked as **PUBLIC**
4. Set file size limit to at least 10MB

### 2. "Permission denied" Error
**Problem**: Storage policies are blocking the upload.

**Solution**:
1. Go to your bucket → Policies tab
2. Add these simple policies for testing:
   - **Policy name**: `Allow all uploads`
   - **Target roles**: `anon`
   - **Policy definition**: `true`
   - **Check expression**: `bucket_id = 'wardrobe-images'`

### 3. "Storage not configured" Error
**Problem**: Environment variables are missing or incorrect.

**Solution**:
1. Check your `.env.local` file exists
2. Verify it contains:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. Make sure there are no extra spaces or quotes
4. Restart your development server

### 4. "CORS" Error
**Problem**: Browser is blocking the request due to CORS policy.

**Solution**:
1. Go to Supabase Dashboard → Settings → API
2. Add `http://localhost:3000` to CORS origins
3. Restart your development server

### 5. "File too large" Error
**Problem**: File exceeds the size limit.

**Solution**:
1. Check the bucket's file size limit in Supabase
2. Make sure it's set to at least 10MB
3. Or reduce the file size in the code (in `lib/imageUpload.ts`)

## Step-by-Step Fix

1. **First, run the diagnostic tool**:
   ```
   http://localhost:3000/test-storage
   ```

2. **If bucket doesn't exist**:
   - Create `wardrobe-images` bucket in Supabase
   - Make it public
   - Set file size limit to 10MB

3. **If permissions are wrong**:
   - Add the simple "allow all" policies (see above)
   - Or follow the detailed guide in `STORAGE_POLICIES_SIMPLE.md`

4. **If environment variables are missing**:
   - Check `.env.local` file
   - Get correct values from Supabase Dashboard → Settings → API
   - Restart your dev server

5. **If CORS issues**:
   - Add your domain to CORS settings
   - Restart your dev server

## Testing the Fix

After making changes:

1. Go to `http://localhost:3000/test-storage`
2. Run both tests
3. If they pass, try adding an item with photos
4. Check the browser console for any remaining errors

## Still Having Issues?

If the diagnostic tool shows all green checkmarks but uploads still fail:

1. **Check browser console** for detailed error messages
2. **Check Supabase logs** in the dashboard
3. **Try a different image file** (smaller size, different format)
4. **Check your internet connection**

## Production Considerations

Once uploads are working in development:

1. **Replace simple policies** with user-specific ones
2. **Add authentication** to restrict access
3. **Set up proper CORS** for your production domain
4. **Consider image optimization** for better performance

The diagnostic tool at `/test-storage` will help you identify exactly what's wrong and guide you through the fix!

'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { uploadImage } from '@/lib/imageUpload'

export default function StorageTest() {
  const [testResult, setTestResult] = useState<string>('')
  const [isTesting, setIsTesting] = useState(false)

  const testStorageConnection = async () => {
    setIsTesting(true)
    setTestResult('Testing storage connection...\n')

    try {
      // Test 1: Check environment variables
      const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
      const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      setTestResult(prev => prev + `Environment variables:\n`)
      setTestResult(prev => prev + `- SUPABASE_URL: ${hasUrl ? '✅ Set' : '❌ Missing'}\n`)
      setTestResult(prev => prev + `- SUPABASE_ANON_KEY: ${hasKey ? '✅ Set' : '❌ Missing'}\n\n`)

      if (!hasUrl || !hasKey) {
        setTestResult(prev => prev + '❌ Environment variables not configured\n')
        return
      }

      // Test 2: Check Supabase client
      setTestResult(prev => prev + 'Testing Supabase client...\n')
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
      
      if (bucketsError) {
        setTestResult(prev => prev + `❌ Error listing buckets: ${bucketsError.message}\n`)
        return
      }

      setTestResult(prev => prev + `✅ Found ${buckets.length} buckets\n`)
      
      const wardrobeBucket = buckets.find(b => b.name === 'wardrobe-images')
      if (!wardrobeBucket) {
        setTestResult(prev => prev + '❌ wardrobe-images bucket not found\n')
        setTestResult(prev => prev + 'Available buckets: ' + buckets.map(b => b.name).join(', ') + '\n')
        return
      }

      setTestResult(prev => prev + '✅ wardrobe-images bucket found\n')
      setTestResult(prev => prev + `- Public: ${wardrobeBucket.public ? 'Yes' : 'No'}\n`)
      setTestResult(prev => prev + `- File size limit: ${wardrobeBucket.file_size_limit || 'No limit'}\n\n`)

      // Test 3: Try to create a test file
      setTestResult(prev => prev + 'Testing file upload...\n')
      const testContent = 'test file content'
      const testBlob = new Blob([testContent], { type: 'text/plain' })
      const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' })
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('wardrobe-images')
        .upload('test/test-file.txt', testFile)

      if (uploadError) {
        setTestResult(prev => prev + `❌ Upload test failed: ${uploadError.message}\n`)
        setTestResult(prev => prev + `Error details: ${JSON.stringify(uploadError, null, 2)}\n`)
        return
      }

      setTestResult(prev => prev + '✅ Test file uploaded successfully\n')
      setTestResult(prev => prev + `Upload data: ${JSON.stringify(uploadData, null, 2)}\n\n`)

      // Test 4: Try to get public URL
      setTestResult(prev => prev + 'Testing public URL generation...\n')
      const { data: urlData } = supabase.storage
        .from('wardrobe-images')
        .getPublicUrl('test/test-file.txt')

      setTestResult(prev => prev + `✅ Public URL: ${urlData.publicUrl}\n\n`)

      // Test 5: Clean up test file
      setTestResult(prev => prev + 'Cleaning up test file...\n')
      const { error: deleteError } = await supabase.storage
        .from('wardrobe-images')
        .remove(['test/test-file.txt'])

      if (deleteError) {
        setTestResult(prev => prev + `⚠️ Could not delete test file: ${deleteError.message}\n`)
      } else {
        setTestResult(prev => prev + '✅ Test file cleaned up\n')
      }

      setTestResult(prev => prev + '\n🎉 All tests passed! Storage should be working.\n')

    } catch (error) {
      setTestResult(prev => prev + `❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}\n`)
      console.error('Storage test error:', error)
    } finally {
      setIsTesting(false)
    }
  }

  const testImageUpload = async () => {
    setIsTesting(true)
    setTestResult('Testing image upload...\n')

    try {
      // Create a simple test image (1x1 pixel PNG)
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = 'red'
        ctx.fillRect(0, 0, 1, 1)
      }
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setTestResult(prev => prev + '❌ Could not create test image\n')
          setIsTesting(false)
          return
        }

        const testFile = new File([blob], 'test-image.png', { type: 'image/png' })
        const result = await uploadImage(testFile, 'test-item-id')

        if (result.success) {
          setTestResult(prev => prev + `✅ Image upload successful!\nURL: ${result.url}\n`)
        } else {
          setTestResult(prev => prev + `❌ Image upload failed: ${result.error}\n`)
        }
        
        setIsTesting(false)
      }, 'image/png')
    } catch (error) {
      setTestResult(prev => prev + `❌ Image upload test error: ${error instanceof Error ? error.message : 'Unknown error'}\n`)
      setIsTesting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Storage Diagnostic Tool</h2>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testStorageConnection}
          disabled={isTesting}
          className="btn-primary disabled:opacity-50"
        >
          {isTesting ? 'Testing...' : 'Test Storage Connection'}
        </button>
        
        <button
          onClick={testImageUpload}
          disabled={isTesting}
          className="btn-secondary disabled:opacity-50"
        >
          {isTesting ? 'Testing...' : 'Test Image Upload'}
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Test Results:</h3>
        <pre className="text-sm whitespace-pre-wrap font-mono">
          {testResult || 'Click a test button to start...'}
        </pre>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <h4 className="font-semibold mb-2">Common Issues:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Bucket not created or not public</li>
          <li>Missing or incorrect environment variables</li>
          <li>Storage policies not configured</li>
          <li>CORS issues</li>
          <li>File size limits exceeded</li>
        </ul>
      </div>
    </div>
  )
}

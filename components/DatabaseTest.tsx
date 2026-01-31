'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { generateId } from '@/lib/utils'

export default function DatabaseTest() {
  const [testResult, setTestResult] = useState<string>('')
  const [isTesting, setIsTesting] = useState(false)

  const testDatabaseConnection = async () => {
    setIsTesting(true)
    setTestResult('Testing database connection...\n')

    try {
      // Test 1: Check if we can connect to Supabase
      setTestResult(prev => prev + 'Testing Supabase connection...\n')
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        setTestResult(prev => prev + `❌ Auth error: ${authError.message}\n`)
      } else {
        setTestResult(prev => prev + `✅ Supabase connection successful\n`)
      }

      // Test 2: Check if clothing_items table exists and has the right structure
      setTestResult(prev => prev + '\nTesting clothing_items table...\n')
      const { data: tableData, error: tableError } = await supabase
        .from('clothing_items')
        .select('*')
        .limit(1)

      if (tableError) {
        setTestResult(prev => prev + `❌ Table error: ${tableError.message}\n`)
        setTestResult(prev => prev + `Error details: ${JSON.stringify(tableError, null, 2)}\n`)
        return
      }

      setTestResult(prev => prev + '✅ clothing_items table accessible\n')

      // Test 3: Try to insert a test item
      setTestResult(prev => prev + '\nTesting item insertion...\n')
      
      const testItem = {
        id: generateId(),
        name: 'Test Item',
        description: 'Test description',
        category: 'Tops',
        brand: 'Test Brand',
        size: 'M',
        color: 'Blue',
        material: 'Cotton',
        price: 29.99,
        care_instructions: 'Machine wash',
        wear_count: 0,
        is_favorite: false,
        image_urls: ['https://example.com/test-image.jpg'],
        user_id: '00000000-0000-0000-0000-000000000000'
      }

      const { data: insertData, error: insertError } = await supabase
        .from('clothing_items')
        .insert(testItem)
        .select()
        .single()

      if (insertError) {
        setTestResult(prev => prev + `❌ Insert error: ${insertError.message}\n`)
        setTestResult(prev => prev + `Error details: ${JSON.stringify(insertError, null, 2)}\n`)
        setTestResult(prev => prev + `Test item data: ${JSON.stringify(testItem, null, 2)}\n`)
        return
      }

      setTestResult(prev => prev + '✅ Test item inserted successfully\n')
      setTestResult(prev => prev + `Inserted data: ${JSON.stringify(insertData, null, 2)}\n`)

      // Test 4: Clean up test item
      setTestResult(prev => prev + '\nCleaning up test item...\n')
      const { error: deleteError } = await supabase
        .from('clothing_items')
        .delete()
        .eq('id', testItem.id)

      if (deleteError) {
        setTestResult(prev => prev + `⚠️ Could not delete test item: ${deleteError.message}\n`)
      } else {
        setTestResult(prev => prev + '✅ Test item cleaned up\n')
      }

      setTestResult(prev => prev + '\n🎉 Database test passed! Items should be able to be added.\n')

    } catch (error) {
      setTestResult(prev => prev + `❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}\n`)
      console.error('Database test error:', error)
    } finally {
      setIsTesting(false)
    }
  }

  const testImageUrlsField = async () => {
    setIsTesting(true)
    setTestResult('Testing image_urls field specifically...\n')

    try {
      // Test with empty image_urls array
      const testItem1 = {
        id: generateId(),
        name: 'Test Item 1',
        category: 'Tops',
        image_urls: [],
        user_id: '00000000-0000-0000-0000-000000000000'
      }

      const { data: data1, error: error1 } = await supabase
        .from('clothing_items')
        .insert(testItem1)
        .select()
        .single()

      if (error1) {
        setTestResult(prev => prev + `❌ Empty array test failed: ${error1.message}\n`)
      } else {
        setTestResult(prev => prev + '✅ Empty image_urls array works\n')
      }

      // Test with image URLs
      const testItem2 = {
        id: generateId(),
        name: 'Test Item 2',
        category: 'Tops',
        image_urls: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        user_id: '00000000-0000-0000-0000-000000000000'
      }

      const { data: data2, error: error2 } = await supabase
        .from('clothing_items')
        .insert(testItem2)
        .select()
        .single()

      if (error2) {
        setTestResult(prev => prev + `❌ Image URLs test failed: ${error2.message}\n`)
        setTestResult(prev => prev + `Error details: ${JSON.stringify(error2, null, 2)}\n`)
      } else {
        setTestResult(prev => prev + '✅ Image URLs array works\n')
        setTestResult(prev => prev + `Inserted with URLs: ${JSON.stringify(data2, null, 2)}\n`)
      }

      // Clean up
      await supabase.from('clothing_items').delete().eq('id', testItem1.id)
      await supabase.from('clothing_items').delete().eq('id', testItem2.id)

    } catch (error) {
      setTestResult(prev => prev + `❌ Image URLs test error: ${error instanceof Error ? error.message : 'Unknown error'}\n`)
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Database Diagnostic Tool</h2>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testDatabaseConnection}
          disabled={isTesting}
          className="btn-primary disabled:opacity-50"
        >
          {isTesting ? 'Testing...' : 'Test Database Connection'}
        </button>
        
        <button
          onClick={testImageUrlsField}
          disabled={isTesting}
          className="btn-secondary disabled:opacity-50"
        >
          {isTesting ? 'Testing...' : 'Test Image URLs Field'}
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Test Results:</h3>
        <pre className="text-sm whitespace-pre-wrap font-mono">
          {testResult || 'Click a test button to start...'}
        </pre>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <h4 className="font-semibold mb-2">Common Database Issues:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Missing image_urls column in clothing_items table</li>
          <li>Wrong data type for image_urls (should be TEXT[])</li>
          <li>Database schema not updated</li>
          <li>Row Level Security policies blocking inserts</li>
          <li>Missing required fields or constraints</li>
        </ul>
      </div>
    </div>
  )
}

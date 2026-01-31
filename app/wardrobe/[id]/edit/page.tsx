'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Navigation from '@/components/Navigation'
import EditItemForm from '@/components/EditItemForm'
import { useWardrobe } from '@/contexts/WardrobeContext'

export default function EditItemPage() {
  const params = useParams()
  const { items } = useWardrobe()
  const id = params.id as string
  const item = items.find((i) => i.id === id)

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="lg:pl-64">
          <div className="px-4 py-8 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Item not found.</p>
              <Link href="/wardrobe" className="btn-primary inline-flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Wardrobe
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="lg:pl-64">
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href={`/wardrobe/${item.id}`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Item
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Item</h1>

          <EditItemForm item={item} />
        </div>
      </div>
    </div>
  )
}

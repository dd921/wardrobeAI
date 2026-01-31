'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, CheckCircle2, Package, FlaskConical } from 'lucide-react'
import Navigation from '@/components/Navigation'
import {
  ImageDropzone,
  AnalysisProgress,
  GroupReview,
  ItemFormModal,
  ItemFormData
} from '@/components/SmartBulkUpload'
import {
  analyzeImages,
  cleanupPreviewUrls,
  SENSITIVITY_THRESHOLDS,
  type ImageGroup,
  type AnalyzedImage,
  type AnalysisProgress as AnalysisProgressType,
  type GroupingSensitivity
} from '@/lib/imageSimilarity'
import { uploadImages } from '@/lib/imageUpload'
import { useWardrobe } from '@/contexts/WardrobeContext'
import { generateId } from '@/lib/utils'
import toast from 'react-hot-toast'

type Step = 'upload' | 'analyzing' | 'review' | 'create' | 'done'

interface CreatedItem {
  name: string
  imageCount: number
}

export default function BulkUploadPage() {
  const router = useRouter()
  const { addItem } = useWardrobe()

  // State
  const [step, setStep] = useState<Step>('upload')
  const [files, setFiles] = useState<File[]>([])
  const [analyzedImages, setAnalyzedImages] = useState<AnalyzedImage[]>([])
  const [groups, setGroups] = useState<ImageGroup[]>([])
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgressType | null>(null)
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [createdItems, setCreatedItems] = useState<CreatedItem[]>([])
  const [pendingGroups, setPendingGroups] = useState<ImageGroup[]>([])
  const [sensitivity, setSensitivity] = useState<GroupingSensitivity>('strict')

  // Handle files selected from dropzone
  const handleFilesSelected = useCallback(async (newFiles: File[]) => {
    const allFiles = [...files, ...newFiles]
    setFiles(allFiles)

    // Auto-start analysis if we have files
    if (allFiles.length > 0) {
      setStep('analyzing')

      try {
        const threshold = SENSITIVITY_THRESHOLDS[sensitivity]
        const result = await analyzeImages(allFiles, setAnalysisProgress, { threshold })
        setAnalyzedImages(result.analyzedImages)
        setGroups(result.groups)
        setStep('review')
      } catch (error) {
        console.error('Analysis failed:', error)
        toast.error('Failed to analyze images. Please try again.')
        setStep('upload')
      }
    }
  }, [files, sensitivity])

  // Handle proceeding from review to create
  const handleProceedToCreate = useCallback(() => {
    if (groups.length === 0) {
      toast.error('No groups to create items from')
      return
    }
    setPendingGroups([...groups])
    setCurrentGroupIndex(0)
    setStep('create')
  }, [groups])

  // Handle saving an item
  const handleSaveItem = useCallback(async (groupId: string, data: ItemFormData) => {
    const group = pendingGroups.find(g => g.id === groupId)
    if (!group) return

    setIsSaving(true)

    try {
      // Generate item ID
      const itemId = generateId()

      // Upload all images in the group
      const imageFiles = group.images.map(img => img.file)
      const uploadResults = await uploadImages(imageFiles, itemId)

      const successfulUrls = uploadResults
        .filter(r => r.success && r.url)
        .map(r => r.url!)

      if (successfulUrls.length === 0) {
        toast.error('Failed to upload images')
        setIsSaving(false)
        return
      }

      // Create the item
      const newItem = await addItem({
        name: data.name,
        category: data.category,
        color: data.color,
        brand: data.brand || undefined,
        size: data.size || undefined,
        tags: data.tags,
        images: successfulUrls,
        isFavorite: false
      })

      if (newItem) {
        // Track created item
        setCreatedItems(prev => [...prev, {
          name: data.name,
          imageCount: group.images.length
        }])

        // Remove from pending groups
        const remaining = pendingGroups.filter(g => g.id !== groupId)
        setPendingGroups(remaining)

        toast.success(`Created "${data.name}"`)

        // Move to next or finish
        if (remaining.length === 0) {
          setStep('done')
        } else {
          // Adjust index if needed
          setCurrentGroupIndex(prev =>
            prev >= remaining.length ? remaining.length - 1 : prev
          )
        }
      } else {
        toast.error('Failed to create item')
      }
    } catch (error) {
      console.error('Error creating item:', error)
      toast.error('Failed to create item')
    } finally {
      setIsSaving(false)
    }
  }, [pendingGroups, addItem])

  // Handle skipping a group
  const handleSkipGroup = useCallback((groupId: string) => {
    const remaining = pendingGroups.filter(g => g.id !== groupId)
    setPendingGroups(remaining)

    if (remaining.length === 0) {
      if (createdItems.length > 0) {
        setStep('done')
      } else {
        toast.error('All items skipped')
        setStep('review')
      }
    } else {
      setCurrentGroupIndex(prev =>
        prev >= remaining.length ? remaining.length - 1 : prev
      )
    }
  }, [pendingGroups, createdItems.length])

  // Handle closing the modal (cancel remaining)
  const handleCloseModal = useCallback(() => {
    if (createdItems.length > 0) {
      setStep('done')
    } else {
      setStep('review')
    }
  }, [createdItems.length])

  // Handle starting over
  const handleStartOver = useCallback(() => {
    // Clean up preview URLs
    cleanupPreviewUrls(analyzedImages)

    // Reset state
    setFiles([])
    setAnalyzedImages([])
    setGroups([])
    setAnalysisProgress(null)
    setCurrentGroupIndex(0)
    setCreatedItems([])
    setPendingGroups([])
    setSensitivity('strict')
    setStep('upload')
  }, [analyzedImages])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <div className="lg:pl-64">
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/wardrobe"
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Smart Bulk Upload
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  <FlaskConical className="h-3 w-3" />
                  Beta
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Upload multiple photos and we&apos;ll group similar items together
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="mb-8">
            <StepIndicator currentStep={step} />
          </div>

          {/* Content based on step */}
          {step === 'upload' && (
            <div className="max-w-2xl mx-auto">
              <ImageDropzone
                onFilesSelected={handleFilesSelected}
                existingCount={files.length}
                sensitivity={sensitivity}
                onSensitivityChange={setSensitivity}
              />

              {files.length > 0 && (
                <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  {files.length} {files.length === 1 ? 'photo' : 'photos'} selected
                </div>
              )}
            </div>
          )}

          {step === 'analyzing' && analysisProgress && (
            <div className="max-w-xl mx-auto">
              <AnalysisProgress progress={analysisProgress} />
            </div>
          )}

          {step === 'review' && (
            <GroupReview
              groups={groups}
              onGroupsChange={setGroups}
              onProceed={handleProceedToCreate}
            />
          )}

          {step === 'create' && pendingGroups.length > 0 && (
            <ItemFormModal
              groups={pendingGroups}
              currentIndex={currentGroupIndex}
              onSave={handleSaveItem}
              onSkip={handleSkipGroup}
              onClose={handleCloseModal}
              onNavigate={setCurrentGroupIndex}
              isSaving={isSaving}
            />
          )}

          {step === 'done' && (
            <div className="max-w-md mx-auto">
              <div className="card text-center py-12">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  All Done!
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Successfully created {createdItems.length}{' '}
                  {createdItems.length === 1 ? 'item' : 'items'}
                </p>

                {/* Summary */}
                {createdItems.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6 text-left">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Created Items
                    </h3>
                    <ul className="space-y-2">
                      {createdItems.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-900 dark:text-gray-100">
                            {item.name}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {item.imageCount} {item.imageCount === 1 ? 'photo' : 'photos'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button onClick={handleStartOver} className="btn-secondary">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload More
                  </button>
                  <Link href="/wardrobe" className="btn-primary">
                    View Wardrobe
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StepIndicator({ currentStep }: { currentStep: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: 'upload', label: 'Upload' },
    { key: 'analyzing', label: 'Analyze' },
    { key: 'review', label: 'Review' },
    { key: 'create', label: 'Create' },
    { key: 'done', label: 'Done' }
  ]

  const currentIndex = steps.findIndex(s => s.key === currentStep)

  return (
    <div className="flex items-center justify-center">
      {steps.map((step, index) => {
        const isActive = index === currentIndex
        const isCompleted = index < currentIndex

        return (
          <div key={step.key} className="flex items-center">
            {/* Step circle */}
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                ${isCompleted
                  ? 'bg-green-500 text-white'
                  : isActive
                    ? 'bg-wardrobe-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }
              `}
            >
              {isCompleted ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                index + 1
              )}
            </div>

            {/* Step label (hidden on mobile) */}
            <span
              className={`
                hidden sm:block ml-2 text-sm font-medium
                ${isActive
                  ? 'text-wardrobe-600 dark:text-wardrobe-400'
                  : isCompleted
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-400 dark:text-gray-500'
                }
              `}
            >
              {step.label}
            </span>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`
                  w-8 sm:w-12 h-0.5 mx-2
                  ${index < currentIndex
                    ? 'bg-green-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                  }
                `}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

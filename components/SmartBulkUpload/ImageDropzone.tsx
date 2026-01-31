'use client'

import { useCallback, useState, useRef } from 'react'
import { Upload, AlertCircle, Settings2, FlaskConical } from 'lucide-react'
import { shouldWarnAboutImageCount, type GroupingSensitivity } from '@/lib/imageSimilarity'

interface ImageDropzoneProps {
  onFilesSelected: (files: File[]) => void
  disabled?: boolean
  existingCount?: number
  sensitivity?: GroupingSensitivity
  onSensitivityChange?: (sensitivity: GroupingSensitivity) => void
}

const SENSITIVITY_INFO: Record<GroupingSensitivity, { label: string; description: string }> = {
  strict: {
    label: 'Strict',
    description: 'Only groups very similar photos together'
  },
  balanced: {
    label: 'Balanced',
    description: 'Groups moderately similar photos'
  },
  loose: {
    label: 'Loose',
    description: 'Groups more liberally, may combine different items'
  }
}

export default function ImageDropzone({
  onFilesSelected,
  disabled = false,
  existingCount = 0,
  sensitivity = 'strict',
  onSensitivityChange
}: ImageDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [warning, setWarning] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateAndSelectFiles = useCallback((fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return

    const files = Array.from(fileList).filter(file =>
      file.type.startsWith('image/')
    )

    if (files.length === 0) {
      setWarning('Please select image files only (JPG, PNG, etc.)')
      return
    }

    if (files.length !== fileList.length) {
      setWarning('Some non-image files were skipped')
    } else {
      setWarning(null)
    }

    const totalCount = existingCount + files.length
    if (shouldWarnAboutImageCount(totalCount)) {
      setWarning(`You're uploading ${totalCount} images. This may slow down the browser.`)
    }

    onFilesSelected(files)
  }, [onFilesSelected, existingCount])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (disabled) return

    validateAndSelectFiles(e.dataTransfer.files)
  }, [disabled, validateAndSelectFiles])

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }, [disabled])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndSelectFiles(e.target.files)
    // Reset input so the same files can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [validateAndSelectFiles])

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 transition-all duration-200
          flex flex-col items-center justify-center min-h-[250px]
          ${disabled
            ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
            : isDragOver
              ? 'border-wardrobe-500 bg-wardrobe-50 dark:bg-wardrobe-900/30 text-wardrobe-700 dark:text-wardrobe-400'
              : 'border-gray-300 dark:border-gray-600 hover:border-wardrobe-400 dark:hover:border-wardrobe-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer'
          }
        `}
      >
        <Upload className={`h-12 w-12 mb-4 ${isDragOver ? 'text-wardrobe-500' : 'text-gray-400'}`} />

        <div className="text-center">
          <p className={`text-lg font-medium ${isDragOver ? 'text-wardrobe-700 dark:text-wardrobe-400' : 'text-gray-700 dark:text-gray-300'}`}>
            {isDragOver ? 'Drop images here' : 'Drag & drop photos'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            or click to browse
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
            Supports JPG, PNG, WebP. Similar photos will be grouped automatically.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-xs text-amber-600 dark:text-amber-400">
            <FlaskConical className="h-3 w-3" />
            <span>Auto-detection is experimental — you&apos;ll review before saving</span>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Sensitivity Selector */}
      {onSensitivityChange && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Settings2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Grouping Sensitivity
            </span>
          </div>

          <div className="flex gap-2">
            {(Object.keys(SENSITIVITY_INFO) as GroupingSensitivity[]).map((key) => (
              <button
                key={key}
                onClick={(e) => {
                  e.stopPropagation()
                  onSensitivityChange(key)
                }}
                disabled={disabled}
                className={`
                  flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
                  ${sensitivity === key
                    ? 'bg-wardrobe-500 text-white shadow-sm'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {SENSITIVITY_INFO[key].label}
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {SENSITIVITY_INFO[sensitivity].description}
          </p>
        </div>
      )}

      {warning && (
        <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-lg">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{warning}</span>
        </div>
      )}
    </div>
  )
}

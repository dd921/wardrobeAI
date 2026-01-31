'use client'

import { useState } from 'react'
import { X, Edit2, Scissors, ChevronDown, ChevronUp, GripVertical, Tag } from 'lucide-react'
import type { ImageGroup, AnalyzedImage } from '@/lib/imageSimilarity'
import { COLOR_MAP } from '@/lib/imageSimilarity'

interface GroupCardProps {
  group: ImageGroup
  onUpdateName: (name: string) => void
  onSplit: () => void
  onDelete: () => void
  onImageDragStart: (image: AnalyzedImage, groupId: string) => void
  onImageDrop: (groupId: string) => void
  isDragTarget?: boolean
}

export default function GroupCard({
  group,
  onUpdateName,
  onSplit,
  onDelete,
  onImageDragStart,
  onImageDrop,
  isDragTarget = false
}: GroupCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(group.suggestedName)
  const [isExpanded, setIsExpanded] = useState(true)

  const handleSaveName = () => {
    if (editName.trim()) {
      onUpdateName(editName.trim())
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName()
    } else if (e.key === 'Escape') {
      setEditName(group.suggestedName)
      setIsEditing(false)
    }
  }

  const colorHex = COLOR_MAP[group.suggestedColor.toLowerCase()] || '#9ca3af'
  const confidencePercent = Math.round(group.confidence * 100)

  return (
    <div
      className={`card transition-all duration-200 ${
        isDragTarget
          ? 'ring-2 ring-wardrobe-500 ring-offset-2 dark:ring-offset-gray-900'
          : ''
      }`}
      onDragOver={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onDrop={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onImageDrop(group.id)
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Color indicator */}
          <div
            className="w-4 h-4 rounded-full border border-gray-200 dark:border-gray-600 flex-shrink-0"
            style={{ backgroundColor: colorHex }}
            title={group.suggestedColor}
          />

          {/* Name */}
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={handleKeyDown}
              autoFocus
              className="input-field text-sm py-1 px-2 flex-1"
            />
          ) : (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {group.suggestedName}
              </h3>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {group.images.length > 1 && (
            <button
              onClick={onSplit}
              className="p-1.5 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              title="Split into separate items"
            >
              <Scissors className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={onDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Delete group"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
        <span className="flex items-center gap-1">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {group.images.length}
          </span>
          {group.images.length === 1 ? 'photo' : 'photos'}
        </span>

        <span className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-full border border-gray-200 dark:border-gray-600"
            style={{ backgroundColor: colorHex }}
          />
          {group.suggestedColor.charAt(0).toUpperCase() + group.suggestedColor.slice(1)}
        </span>

        {group.detectedCategory && group.detectedCategory !== 'Other' && (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-wardrobe-100 dark:bg-wardrobe-900/30 text-wardrobe-700 dark:text-wardrobe-400 rounded-full">
            <Tag className="h-3 w-3" />
            {group.detectedCategory}
            {group.categoryConfidence !== undefined && (
              <span className="text-wardrobe-500 dark:text-wardrobe-500">
                ({Math.round(group.categoryConfidence * 100)}%)
              </span>
            )}
          </span>
        )}

        {group.images.length > 1 && (
          <span className={`${
            confidencePercent >= 85
              ? 'text-green-600 dark:text-green-400'
              : confidencePercent >= 70
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-red-600 dark:text-red-400'
          }`}>
            {confidencePercent}% match
          </span>
        )}
      </div>

      {/* Image Grid */}
      {isExpanded && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {group.images.map((image) => (
            <div
              key={image.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move'
                onImageDragStart(image, group.id)
              }}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 cursor-grab active:cursor-grabbing group"
            >
              <img
                src={image.previewUrl}
                alt="Clothing item"
                className="w-full h-full object-cover"
                draggable={false}
              />

              {/* Drag handle overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <GripVertical className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
              </div>

              {/* Color dots */}
              <div className="absolute bottom-1 right-1 flex gap-0.5">
                {image.dominantColors.slice(0, 3).map((color, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full border border-white/50"
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

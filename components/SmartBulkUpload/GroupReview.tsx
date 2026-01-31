'use client'

import { useState, useCallback } from 'react'
import { Plus, Layers, Trash2, AlertTriangle } from 'lucide-react'
import GroupCard from './GroupCard'
import type { ImageGroup, AnalyzedImage } from '@/lib/imageSimilarity'
import {
  splitGroup,
  moveImageBetweenGroups,
  createSingleImageGroup
} from '@/lib/imageSimilarity'
import { generateId } from '@/lib/utils'

interface GroupReviewProps {
  groups: ImageGroup[]
  onGroupsChange: (groups: ImageGroup[]) => void
  onProceed: () => void
}

export default function GroupReview({
  groups,
  onGroupsChange,
  onProceed
}: GroupReviewProps) {
  const [draggedImage, setDraggedImage] = useState<{
    image: AnalyzedImage
    sourceGroupId: string
  } | null>(null)
  const [dragTargetGroupId, setDragTargetGroupId] = useState<string | null>(null)

  // Handle updating a group's name
  const handleUpdateName = useCallback((groupId: string, name: string) => {
    onGroupsChange(
      groups.map((g) => (g.id === groupId ? { ...g, suggestedName: name } : g))
    )
  }, [groups, onGroupsChange])

  // Handle splitting a group into individual items
  const handleSplit = useCallback((groupId: string) => {
    const groupToSplit = groups.find((g) => g.id === groupId)
    if (!groupToSplit || groupToSplit.images.length <= 1) return

    const newGroups = splitGroup(groupToSplit)
    onGroupsChange([
      ...groups.filter((g) => g.id !== groupId),
      ...newGroups
    ])
  }, [groups, onGroupsChange])

  // Handle deleting a group
  const handleDelete = useCallback((groupId: string) => {
    onGroupsChange(groups.filter((g) => g.id !== groupId))
  }, [groups, onGroupsChange])

  // Handle image drag start
  const handleImageDragStart = useCallback((image: AnalyzedImage, groupId: string) => {
    setDraggedImage({ image, sourceGroupId: groupId })
  }, [])

  // Handle dropping an image on a group
  const handleImageDrop = useCallback((targetGroupId: string) => {
    if (!draggedImage) return
    if (draggedImage.sourceGroupId === targetGroupId) {
      setDraggedImage(null)
      setDragTargetGroupId(null)
      return
    }

    const sourceGroup = groups.find((g) => g.id === draggedImage.sourceGroupId)
    const targetGroup = groups.find((g) => g.id === targetGroupId)

    if (!sourceGroup || !targetGroup) {
      setDraggedImage(null)
      setDragTargetGroupId(null)
      return
    }

    const { source, target } = moveImageBetweenGroups(
      draggedImage.image,
      sourceGroup,
      targetGroup
    )

    const newGroups = groups
      .map((g) => {
        if (g.id === sourceGroup.id) return source
        if (g.id === targetGroup.id) return target
        return g
      })
      .filter((g): g is ImageGroup => g !== null)

    onGroupsChange(newGroups)
    setDraggedImage(null)
    setDragTargetGroupId(null)
  }, [draggedImage, groups, onGroupsChange])

  // Handle creating a new group from dragged image
  const handleCreateNewGroup = useCallback(() => {
    if (!draggedImage) return

    const sourceGroup = groups.find((g) => g.id === draggedImage.sourceGroupId)
    if (!sourceGroup) {
      setDraggedImage(null)
      return
    }

    // Create new group with the image
    const newGroup = createSingleImageGroup(draggedImage.image)

    // Remove image from source
    const newSourceImages = sourceGroup.images.filter(
      (img) => img.id !== draggedImage.image.id
    )

    let newGroups: ImageGroup[]

    if (newSourceImages.length === 0) {
      // Remove empty source group
      newGroups = [...groups.filter((g) => g.id !== sourceGroup.id), newGroup]
    } else {
      // Update source group
      newGroups = [
        ...groups.map((g) =>
          g.id === sourceGroup.id ? { ...g, images: newSourceImages } : g
        ),
        newGroup
      ]
    }

    onGroupsChange(newGroups)
    setDraggedImage(null)
  }, [draggedImage, groups, onGroupsChange])

  const totalImages = groups.reduce((acc, g) => acc + g.images.length, 0)

  return (
    <div className="space-y-6">
      {/* Beta Notice */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-700 dark:text-amber-300">
          <span className="font-semibold">Beta Feature:</span> Groupings, names, and colors are auto-generated and may be incorrect.
          Please review each group and drag photos between groups if needed. You can edit all details before saving.
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Layers className="h-5 w-5 text-wardrobe-500" />
            Review Groups
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {groups.length} {groups.length === 1 ? 'group' : 'groups'} detected
            from {totalImages} {totalImages === 1 ? 'photo' : 'photos'}.
            Drag photos between groups to adjust.
          </p>
        </div>

        <button
          onClick={onProceed}
          disabled={groups.length === 0}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Create Items
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="card text-center py-12">
          <Trash2 className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No groups remaining
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Go back to upload more photos.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Group cards */}
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onUpdateName={(name) => handleUpdateName(group.id, name)}
              onSplit={() => handleSplit(group.id)}
              onDelete={() => handleDelete(group.id)}
              onImageDragStart={handleImageDragStart}
              onImageDrop={handleImageDrop}
              isDragTarget={dragTargetGroupId === group.id}
            />
          ))}

          {/* New group drop zone */}
          {draggedImage && (
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragTargetGroupId('new')
              }}
              onDragLeave={() => setDragTargetGroupId(null)}
              onDrop={(e) => {
                e.preventDefault()
                handleCreateNewGroup()
              }}
              className={`border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${
                dragTargetGroupId === 'new'
                  ? 'border-wardrobe-500 bg-wardrobe-50 dark:bg-wardrobe-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                <Plus className={`h-8 w-8 mb-2 ${
                  dragTargetGroupId === 'new'
                    ? 'text-wardrobe-500'
                    : 'text-gray-400'
                }`} />
                <span className="font-medium">Drop here to create new group</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom action bar (sticky on mobile) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <button
          onClick={onProceed}
          disabled={groups.length === 0}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Create Items ({groups.length})
        </button>
      </div>
    </div>
  )
}

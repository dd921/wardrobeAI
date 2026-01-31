'use client'

import { Loader2, ImageIcon, Palette, Layers, Sparkles } from 'lucide-react'
import type { AnalysisProgress as AnalysisProgressType } from '@/lib/imageSimilarity'

interface AnalysisProgressProps {
  progress: AnalysisProgressType
}

export default function AnalysisProgress({ progress }: AnalysisProgressProps) {
  const percentage = Math.round((progress.current / progress.total) * 100)

  const getStageIcon = () => {
    switch (progress.stage) {
      case 'hashing':
        return <ImageIcon className="h-5 w-5" />
      case 'colors':
        return <Palette className="h-5 w-5" />
      case 'classifying':
        return <Sparkles className="h-5 w-5" />
      case 'grouping':
        return <Layers className="h-5 w-5" />
      default:
        return <Loader2 className="h-5 w-5 animate-spin" />
    }
  }

  const getStageLabel = () => {
    switch (progress.stage) {
      case 'hashing':
        return 'Analyzing images'
      case 'colors':
        return 'Extracting colors'
      case 'classifying':
        return 'Detecting clothing types'
      case 'grouping':
        return 'Finding similar items'
      case 'complete':
        return 'Complete!'
      default:
        return 'Processing'
    }
  }

  return (
    <div className="card p-8">
      <div className="max-w-md mx-auto">
        {/* Icon and Stage Label */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className={`p-3 rounded-xl ${progress.stage === 'complete' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-wardrobe-100 text-wardrobe-600 dark:bg-wardrobe-900/30 dark:text-wardrobe-400'}`}>
            {progress.stage === 'complete' ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              getStageIcon()
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {getStageLabel()}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {progress.message}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {progress.current} of {progress.total} images
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {percentage}%
            </span>
          </div>

          <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                progress.stage === 'complete'
                  ? 'bg-green-500'
                  : 'bg-gradient-to-r from-wardrobe-500 to-wardrobe-400'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Stage Indicators */}
        <div className="flex justify-between mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
          <StageIndicator
            icon={<ImageIcon className="h-4 w-4" />}
            label="Hash"
            active={progress.stage === 'hashing'}
            completed={['colors', 'classifying', 'grouping', 'complete'].includes(progress.stage)}
          />
          <StageIndicator
            icon={<Palette className="h-4 w-4" />}
            label="Colors"
            active={progress.stage === 'colors'}
            completed={['classifying', 'grouping', 'complete'].includes(progress.stage)}
          />
          <StageIndicator
            icon={<Sparkles className="h-4 w-4" />}
            label="Classify"
            active={progress.stage === 'classifying'}
            completed={['grouping', 'complete'].includes(progress.stage)}
          />
          <StageIndicator
            icon={<Layers className="h-4 w-4" />}
            label="Group"
            active={progress.stage === 'grouping'}
            completed={progress.stage === 'complete'}
          />
        </div>
      </div>
    </div>
  )
}

function StageIndicator({
  icon,
  label,
  active,
  completed
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  completed: boolean
}) {
  return (
    <div className={`flex flex-col items-center gap-1 ${
      active
        ? 'text-wardrobe-600 dark:text-wardrobe-400'
        : completed
          ? 'text-green-600 dark:text-green-400'
          : 'text-gray-300 dark:text-gray-600'
    }`}>
      <div className={`p-2 rounded-lg ${
        active
          ? 'bg-wardrobe-100 dark:bg-wardrobe-900/30'
          : completed
            ? 'bg-green-100 dark:bg-green-900/30'
            : 'bg-gray-100 dark:bg-gray-800'
      }`}>
        {completed ? (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : active ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          icon
        )}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </div>
  )
}

'use client'

import { ReactNode } from 'react'
import { StepNavigation } from './step-navigation'
import { VideoPreview } from './video-preview'

interface EditorLayoutProps {
  children: ReactNode
  currentStep: number
  onStepClick?: (step: number) => void
  completedSteps?: number[]
  previewImages?: string[]
  isPreviewLoading?: boolean
}

export function EditorLayout({
  children,
  currentStep,
  onStepClick,
  completedSteps = [],
  previewImages = [],
  isPreviewLoading = false,
}: EditorLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* 左: ステップナビゲーション */}
      <StepNavigation
        currentStep={currentStep}
        onStepClick={onStepClick}
        completedSteps={completedSteps}
      />

      {/* 中央: 編集エリア */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          {children}
        </div>
      </main>

      {/* 右: プレビュー */}
      <VideoPreview
        images={previewImages}
        isLoading={isPreviewLoading}
      />
    </div>
  )
}

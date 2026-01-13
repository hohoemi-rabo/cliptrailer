'use client'

import { cn } from '@/lib/utils'

export type Step = {
  id: number
  label: string
  description: string
}

const steps: Step[] = [
  { id: 1, label: 'URL入力', description: '記事を取得' },
  { id: 2, label: '台本', description: 'スクリプト編集' },
  { id: 3, label: '画像', description: '4枚生成' },
  { id: 4, label: '音声', description: 'ナレーション' },
  { id: 5, label: 'BGM', description: '音楽選択' },
  { id: 6, label: '書き出し', description: '動画生成' },
]

interface StepNavigationProps {
  currentStep: number
  onStepClick?: (step: number) => void
  completedSteps?: number[]
}

export function StepNavigation({
  currentStep,
  onStepClick,
  completedSteps = [],
}: StepNavigationProps) {
  return (
    <nav className="w-48 flex-shrink-0 border-r border-border bg-card/50 p-4">
      <div className="space-y-1">
        {steps.map((step) => {
          const isActive = currentStep === step.id
          const isCompleted = completedSteps.includes(step.id)
          const isClickable = onStepClick && (isCompleted || step.id <= currentStep)

          return (
            <button
              key={step.id}
              onClick={() => isClickable && onStepClick?.(step.id)}
              disabled={!isClickable}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                isActive && 'bg-primary/10 text-primary',
                !isActive && isCompleted && 'text-muted-foreground hover:bg-accent',
                !isActive && !isCompleted && 'text-muted-foreground/50',
                isClickable && 'cursor-pointer',
                !isClickable && 'cursor-not-allowed'
              )}
            >
              <span
                className={cn(
                  'flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium',
                  isActive && 'bg-primary text-primary-foreground',
                  !isActive && isCompleted && 'bg-green-500/20 text-green-500',
                  !isActive && !isCompleted && 'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted && !isActive ? '✓' : step.id}
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{step.label}</span>
                <span className="text-xs text-muted-foreground">{step.description}</span>
              </div>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

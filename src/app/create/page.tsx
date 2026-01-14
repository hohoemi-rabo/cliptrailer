'use client'

import { useState } from 'react'
import { EditorLayout } from '@/components/layout/editor-layout'
import { Step1UrlInput } from '@/components/steps/step1-url-input'
import { Step2Script } from '@/components/steps/step2-script'
import { Step3Images } from '@/components/steps/step3-images'
import { Step4Voice } from '@/components/steps/step4-voice'
import { Step5BGM } from '@/components/steps/step5-bgm'
import { Step6Export } from '@/components/steps/step6-export'
import { Article } from '@/types/article'
import { Script } from '@/types/script'
import { GeneratedImage } from '@/types/image'
import { VoiceAudio } from '@/types/voice'
import { BGMTrack } from '@/types/bgm'
import { ExportedVideo } from '@/types/video'

// プロジェクト全体の状態
interface ProjectState {
  article: Article | null
  script: Script | null
  images: GeneratedImage[]
  voice: VoiceAudio | null
  bgm: BGMTrack | null // nullの場合はBGMなし
  video: ExportedVideo | null
}

const initialState: ProjectState = {
  article: null,
  script: null,
  images: [],
  voice: null,
  bgm: null,
  video: null,
}

export default function CreatePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [project, setProject] = useState<ProjectState>(initialState)

  const handleStepClick = (step: number) => {
    setCurrentStep(step)
  }

  const completeStep = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step])
    }
    setCurrentStep(step + 1)
  }

  // Step 1: 記事取得完了
  const handleArticleComplete = (article: Article) => {
    setProject((prev) => ({ ...prev, article }))
    completeStep(1)
  }

  // Step 2: 台本確定
  const handleScriptComplete = (script: Script) => {
    setProject((prev) => ({ ...prev, script }))
    completeStep(2)
  }

  // Step 3: 画像確定
  const handleImagesComplete = (images: GeneratedImage[]) => {
    setProject((prev) => ({ ...prev, images }))
    completeStep(3)
  }

  // Step 4: 音声確定
  const handleVoiceComplete = (voice: VoiceAudio) => {
    setProject((prev) => ({ ...prev, voice }))
    completeStep(4)
  }

  // Step 5: BGM確定
  const handleBGMComplete = (bgm: BGMTrack | null) => {
    setProject((prev) => ({ ...prev, bgm }))
    completeStep(5)
  }

  // Step 6: 動画完成
  const handleVideoComplete = (video: ExportedVideo) => {
    setProject((prev) => ({ ...prev, video }))
    // 完成後は最初からやり直し
    setProject(initialState)
    setCurrentStep(1)
    setCompletedSteps([])
  }

  return (
    <EditorLayout
      currentStep={currentStep}
      onStepClick={handleStepClick}
      completedSteps={completedSteps}
    >
      {/* Step 1: URL入力・記事取得 */}
      {currentStep === 1 && (
        <Step1UrlInput onComplete={handleArticleComplete} />
      )}

      {/* Step 2: 台本編集 */}
      {currentStep === 2 && project.article && (
        <Step2Script
          article={project.article}
          onComplete={handleScriptComplete}
        />
      )}

      {/* Step 3: 画像 */}
      {currentStep === 3 && project.script && (
        <Step3Images
          script={project.script}
          onComplete={handleImagesComplete}
        />
      )}

      {/* Step 4: 音声 */}
      {currentStep === 4 && project.script && (
        <Step4Voice
          script={project.script}
          onComplete={handleVoiceComplete}
        />
      )}

      {/* Step 5: BGM */}
      {currentStep === 5 && (
        <Step5BGM onComplete={handleBGMComplete} />
      )}

      {/* Step 6: 書き出し */}
      {currentStep === 6 && project.article && project.script && project.voice && (
        <Step6Export
          article={project.article}
          script={project.script}
          images={project.images}
          voice={project.voice}
          bgm={project.bgm}
          onComplete={handleVideoComplete}
        />
      )}
    </EditorLayout>
  )
}

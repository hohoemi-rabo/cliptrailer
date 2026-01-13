'use client'

import { useState } from 'react'
import { EditorLayout } from '@/components/layout/editor-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Step1UrlInput } from '@/components/steps/step1-url-input'
import { Article } from '@/types/article'

// プロジェクト全体の状態
interface ProjectState {
  article: Article | null
  script: string | null
  images: string[]
  voiceUrl: string | null
  voiceType: 'male' | 'female' | null
  bgmUrl: string | null
}

const initialState: ProjectState = {
  article: null,
  script: null,
  images: [],
  voiceUrl: null,
  voiceType: null,
  bgmUrl: null,
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
  const handleScriptComplete = () => {
    completeStep(2)
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
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: 台本編集</CardTitle>
            <CardDescription>
              取得した記事: {project.article?.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">記事内容</h4>
              <p className="text-sm text-muted-foreground line-clamp-5">
                {project.article?.content}
              </p>
            </div>
            <Textarea
              placeholder="台本がここに表示されます...（次のチケットで実装）"
              className="min-h-[200px]"
              defaultValue={project.script || ''}
            />
            <Button onClick={handleScriptComplete} className="w-full">
              次へ
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 3: 画像 */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: 画像生成</CardTitle>
            <CardDescription>
              4枚の画像を生成します（次のチケットで実装）
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-[9/16] bg-muted rounded-lg flex items-center justify-center"
                >
                  <span className="text-muted-foreground">画像 {i}</span>
                </div>
              ))}
            </div>
            <Button onClick={() => completeStep(3)} className="w-full">
              次へ
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 4: 音声 */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4: 音声生成</CardTitle>
            <CardDescription>
              ナレーション音声を生成します（次のチケットで実装）
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1">
                男性ボイス
              </Button>
              <Button variant="outline" className="flex-1">
                女性ボイス
              </Button>
            </div>
            <Button onClick={() => completeStep(4)} className="w-full">
              次へ
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 5: BGM */}
      {currentStep === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 5: BGM選択</CardTitle>
            <CardDescription>
              BGMを選択してください（次のチケットで実装）
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {['BGM候補 1', 'BGM候補 2', 'BGM候補 3', 'BGMなし'].map((bgm) => (
                <Button key={bgm} variant="outline" className="w-full justify-start">
                  {bgm}
                </Button>
              ))}
            </div>
            <Button onClick={() => completeStep(5)} className="w-full">
              次へ
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 6: 書き出し */}
      {currentStep === 6 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 6: 動画書き出し</CardTitle>
            <CardDescription>
              動画を生成してダウンロード（次のチケットで実装）
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎬</div>
              <p className="text-muted-foreground mb-4">
                準備完了！動画を生成しましょう
              </p>
            </div>
            <Button className="w-full">
              動画を生成
            </Button>
          </CardContent>
        </Card>
      )}
    </EditorLayout>
  )
}

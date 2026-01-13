'use client'

import { useState } from 'react'
import { EditorLayout } from '@/components/layout/editor-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export default function CreatePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const handleStepClick = (step: number) => {
    setCurrentStep(step)
  }

  const handleNextStep = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep])
    }
    setCurrentStep(currentStep + 1)
  }

  return (
    <EditorLayout
      currentStep={currentStep}
      onStepClick={handleStepClick}
      completedSteps={completedSteps}
    >
      {/* Step 1: URL入力 */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: 記事URL入力</CardTitle>
            <CardDescription>
              note.comの記事URLを入力してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="https://note.com/username/n/xxxxxxxx"
              className="w-full"
            />
            <Button onClick={handleNextStep} className="w-full">
              記事を取得
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: 台本 */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: 台本編集</CardTitle>
            <CardDescription>
              生成された台本を編集できます
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="台本がここに表示されます..."
              className="min-h-[200px]"
            />
            <Button onClick={handleNextStep} className="w-full">
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
              4枚の画像を生成します
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
            <Button onClick={handleNextStep} className="w-full">
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
              ナレーション音声を生成します
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
            <Button onClick={handleNextStep} className="w-full">
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
              BGMを選択してください（任意）
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
            <Button onClick={handleNextStep} className="w-full">
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
              動画を生成してダウンロード
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

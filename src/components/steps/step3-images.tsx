'use client'

import { useState, useRef } from 'react'
import { Loader2, RefreshCw, Upload, ImageIcon, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Script } from '@/types/script'
import { GeneratedImage, ImageStyle, IMAGE_STYLE_LABELS, IMAGE_STYLE_DESCRIPTIONS } from '@/types/image'
import { generateAllImages, generateSingleImage } from '@/app/actions/image'

interface Step3ImagesProps {
  script: Script
  onComplete: (images: GeneratedImage[]) => void
}

const SECTION_LABELS = ['フック', 'ベネフィット', '結論', 'CTA']
const SECTION_KEYS: Array<'hook' | 'benefit' | 'conclusion' | 'cta'> = [
  'hook',
  'benefit',
  'conclusion',
  'cta',
]

const STYLE_OPTIONS: ImageStyle[] = ['modern', 'illustration']

export function Step3Images({ script, onComplete }: Step3ImagesProps) {
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('modern')
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleGenerateAll = async () => {
    setIsGenerating(true)
    try {
      const result = await generateAllImages({
        scriptHook: script.hook,
        scriptBenefit: script.benefit,
        scriptConclusion: script.conclusion,
        scriptCta: script.cta,
        style: selectedStyle,
      })

      if (result.success && result.images) {
        setImages(result.images)
        const successCount = result.images.filter((img) => img.url).length
        if (successCount === 4) {
          toast.success('4枚の画像を生成しました')
        } else {
          toast.warning(`${successCount}枚の画像を生成しました。失敗した画像は再生成してください。`)
        }
      } else {
        toast.error(result.error || '画像の生成に失敗しました')
      }
    } catch {
      toast.error('エラーが発生しました')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerate = async (index: number) => {
    setRegeneratingIndex(index)
    try {
      const sectionKey = SECTION_KEYS[index]
      const content = script[sectionKey]
      const result = await generateSingleImage(sectionKey, content, index, selectedStyle)

      if (result.success && result.image) {
        setImages((prev) => {
          const newImages = [...prev]
          newImages[index] = result.image!
          return newImages
        })
        toast.success(`画像${index + 1}を再生成しました`)
      } else {
        toast.error(result.error || '再生成に失敗しました')
      }
    } catch {
      toast.error('エラーが発生しました')
    } finally {
      setRegeneratingIndex(null)
    }
  }

  const handleUpload = (index: number) => {
    fileInputRefs.current[index]?.click()
  }

  const handleFileChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('画像ファイルを選択してください')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setImages((prev) => {
        const newImages = [...prev]
        // 既存の画像がない場合は新規作成
        if (!newImages[index]) {
          newImages[index] = {
            id: `upload-${Date.now()}-${index}`,
            index,
            url: dataUrl,
            prompt: '',
            isUserUploaded: true,
            createdAt: new Date(),
          }
        } else {
          newImages[index] = {
            ...newImages[index],
            url: dataUrl,
            isUserUploaded: true,
          }
        }
        return newImages
      })
      toast.success(`画像${index + 1}をアップロードしました`)
    }
    reader.readAsDataURL(file)
  }

  const handleComplete = () => {
    const validImages = images.filter((img) => img && img.url)
    if (validImages.length < 4) {
      toast.error('4枚すべての画像を準備してください')
      return
    }
    onComplete(images)
  }

  const allImagesReady = images.length === 4 && images.every((img) => img && img.url)

  return (
    <div className="space-y-6">
      {/* 台本プレビュー */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">台本内容</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><span className="font-medium">フック:</span> {script.hook}</p>
          <p><span className="font-medium">ベネフィット:</span> {script.benefit}</p>
          <p><span className="font-medium">結論:</span> {script.conclusion}</p>
          <p><span className="font-medium">CTA:</span> {script.cta}</p>
        </CardContent>
      </Card>

      {/* スタイル選択 */}
      {images.length === 0 && (
        <div className="space-y-3">
          <h3 className="font-medium">画像スタイルを選択</h3>
          <div className="grid grid-cols-2 gap-3">
            {STYLE_OPTIONS.map((style) => (
              <button
                key={style}
                onClick={() => setSelectedStyle(style)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  selectedStyle === style
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <p className="font-medium text-sm">{IMAGE_STYLE_LABELS[style]}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {IMAGE_STYLE_DESCRIPTIONS[style]}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 生成ボタン */}
      {images.length === 0 && (
        <Button
          onClick={handleGenerateAll}
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              生成中...（時間がかかる場合があります）
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              AIで4枚の画像を生成
            </>
          )}
        </Button>
        /* 開発用：仮画像でスキップ（コメントアウト）
        <Button
          variant="outline"
          onClick={() => {
            const colors = ['#4f46e5', '#0891b2', '#059669', '#d97706']
            const placeholderImages: GeneratedImage[] = SECTION_KEYS.map((key, index) => {
              const canvas = document.createElement('canvas')
              canvas.width = 1080
              canvas.height = 1920
              const ctx = canvas.getContext('2d')!
              ctx.fillStyle = colors[index]
              ctx.fillRect(0, 0, 1080, 1920)
              ctx.fillStyle = '#ffffff'
              ctx.font = 'bold 120px sans-serif'
              ctx.textAlign = 'center'
              ctx.textBaseline = 'middle'
              ctx.fillText(SECTION_LABELS[index], 540, 960)
              const dataUrl = canvas.toDataURL('image/png')
              return {
                id: `placeholder-${Date.now()}-${index}`,
                index,
                url: dataUrl,
                prompt: `Placeholder for ${key}`,
                isUserUploaded: false,
                createdAt: new Date(),
              }
            })
            setImages(placeholderImages)
            toast.success('仮画像を設定しました（開発用）')
          }}
          disabled={isGenerating}
          className="w-full"
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          仮画像でスキップ（開発用）
        </Button>
        */
      )}

      {/* 画像グリッド */}
      {(images.length > 0 || isGenerating) && (
        <div className="grid grid-cols-2 gap-4">
          {[0, 1, 2, 3].map((index) => {
            const image = images[index]
            const isLoading = isGenerating || regeneratingIndex === index

            return (
              <div key={index} className="space-y-2">
                <p className="text-sm font-medium text-center">{SECTION_LABELS[index]}</p>
                <div className="relative aspect-[9/16] bg-muted rounded-lg overflow-hidden">
                  {isLoading && !image?.url ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : image?.url ? (
                    <Image
                      src={image.url}
                      alt={`画像 ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  {regeneratingIndex === index && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleRegenerate(index)}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`mr-1 h-3 w-3 ${regeneratingIndex === index ? 'animate-spin' : ''}`} />
                    再生成
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleUpload(index)}
                    disabled={isLoading}
                  >
                    <Upload className="mr-1 h-3 w-3" />
                    差替え
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={(el) => { fileInputRefs.current[index] = el }}
                    onChange={(e) => handleFileChange(index, e)}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 再生成ボタン（全体） */}
      {images.length > 0 && (
        <Button
          variant="outline"
          onClick={handleGenerateAll}
          disabled={isGenerating}
          className="w-full"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
          すべて再生成
        </Button>
      )}

      {/* 確定ボタン */}
      {images.length > 0 && (
        <Button
          onClick={handleComplete}
          className="w-full"
          size="lg"
          disabled={!allImagesReady}
        >
          画像を確定して次へ
        </Button>
      )}
    </div>
  )
}

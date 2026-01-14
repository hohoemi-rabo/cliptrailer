'use client'

import { useState, useRef, useEffect } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import {
  Loader2,
  Download,
  Copy,
  Check,
  Subtitles,
  Video,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { Article } from '@/types/article'
import { Script } from '@/types/script'
import { GeneratedImage } from '@/types/image'
import { VoiceAudio } from '@/types/voice'
import { BGMTrack } from '@/types/bgm'
import { ExportedVideo } from '@/types/video'
import { generateCaption } from '@/app/actions/caption'

interface Step6ExportProps {
  article: Article
  script: Script
  images: GeneratedImage[]
  voice: VoiceAudio
  bgm: BGMTrack | null
  onComplete: (video: ExportedVideo) => void
}

export function Step6Export({
  article,
  script,
  images,
  voice,
  bgm,
  onComplete,
}: Step6ExportProps) {
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')
  const [exportedVideo, setExportedVideo] = useState<ExportedVideo | null>(null)
  const [copiedCaption, setCopiedCaption] = useState(false)
  const [copiedHashtags, setCopiedHashtags] = useState(false)
  const ffmpegRef = useRef<FFmpeg | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // FFmpegの初期化
  const loadFFmpeg = async () => {
    if (ffmpegRef.current) return ffmpegRef.current

    const ffmpeg = new FFmpeg()

    ffmpeg.on('progress', ({ progress: p }) => {
      setProgress(Math.round(p * 100))
    })

    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    })

    ffmpegRef.current = ffmpeg
    return ffmpeg
  }

  // Base64画像をBlobに変換
  const base64ToBlob = async (base64: string): Promise<Blob> => {
    const response = await fetch(base64)
    return response.blob()
  }

  // 動画生成
  const handleGenerate = async () => {
    setIsGenerating(true)
    setProgress(0)

    try {
      // 1. FFmpeg読み込み
      setProgressMessage('FFmpegを読み込み中...')
      const ffmpeg = await loadFFmpeg()

      // 2. 画像ファイルを書き込み
      setProgressMessage('画像を処理中...')
      for (let i = 0; i < images.length; i++) {
        const imageBlob = await base64ToBlob(images[i].url)
        await ffmpeg.writeFile(`image${i}.png`, await fetchFile(imageBlob))
      }

      // 3. 音声ファイルを書き込み
      setProgressMessage('音声を処理中...')
      const voiceBlob = await base64ToBlob(voice.url)
      await ffmpeg.writeFile('voice.wav', await fetchFile(voiceBlob))

      // 4. BGMファイルを書き込み（選択されている場合）
      if (bgm) {
        setProgressMessage('BGMを処理中...')
        await ffmpeg.writeFile('bgm.mp3', await fetchFile(bgm.url))
      }

      // 5. 画像の表示時間を計算（音声長に合わせて均等割り）
      const imageDuration = Math.max(voice.duration / 4, 2) // 最低2秒

      // 6. 画像リストファイルを作成
      let concatContent = ''
      for (let i = 0; i < images.length; i++) {
        concatContent += `file 'image${i}.png'\nduration ${imageDuration}\n`
      }
      // 最後の画像を追加（FFmpegの仕様）
      concatContent += `file 'image${images.length - 1}.png'\n`
      await ffmpeg.writeFile('images.txt', concatContent)

      // 7. 動画合成
      setProgressMessage('動画を生成中...')

      if (bgm) {
        // BGMあり: 音声とBGMをミックス
        await ffmpeg.exec([
          '-f', 'concat',
          '-safe', '0',
          '-i', 'images.txt',
          '-i', 'voice.wav',
          '-i', 'bgm.mp3',
          '-filter_complex',
          '[1:a]volume=1.0[voice];[2:a]volume=0.3,afade=t=out:st=13:d=2[bgm];[voice][bgm]amix=inputs=2:duration=first[a]',
          '-map', '0:v',
          '-map', '[a]',
          '-c:v', 'libx264',
          '-pix_fmt', 'yuv420p',
          '-r', '30',
          '-t', '15',
          '-y',
          'output.mp4'
        ])
      } else {
        // BGMなし: 音声のみ
        await ffmpeg.exec([
          '-f', 'concat',
          '-safe', '0',
          '-i', 'images.txt',
          '-i', 'voice.wav',
          '-map', '0:v',
          '-map', '1:a',
          '-c:v', 'libx264',
          '-pix_fmt', 'yuv420p',
          '-r', '30',
          '-t', '15',
          '-y',
          'output.mp4'
        ])
      }

      // 8. 出力ファイルを読み込み
      setProgressMessage('動画を出力中...')
      const data = await ffmpeg.readFile('output.mp4')
      // Uint8Arrayからsliceで新しいArrayBufferを作成してBlobに変換
      const uint8Data = data as Uint8Array
      const arrayBuffer = uint8Data.buffer.slice(
        uint8Data.byteOffset,
        uint8Data.byteOffset + uint8Data.byteLength
      ) as ArrayBuffer
      const videoBlob = new Blob([arrayBuffer], { type: 'video/mp4' })
      const videoUrl = URL.createObjectURL(videoBlob)

      // 9. キャプション・ハッシュタグ生成
      setProgressMessage('キャプションを生成中...')
      const captionResult = await generateCaption({
        articleTitle: article.title,
        scriptHook: script.hook,
      })

      // 10. 完成データを作成
      const video: ExportedVideo = {
        id: `video-${Date.now()}`,
        videoUrl,
        thumbnailUrl: images[0].url,
        caption: captionResult.success ? captionResult.caption! : '',
        hashtags: captionResult.success ? captionResult.hashtags! : [],
        subtitlesEnabled,
        duration: 15,
        createdAt: new Date(),
      }

      setExportedVideo(video)
      setProgressMessage('完了！')
      toast.success('動画を生成しました！')

    } catch (error) {
      console.error('Video generation error:', error)
      toast.error('動画の生成に失敗しました')
      setProgressMessage('')
    } finally {
      setIsGenerating(false)
    }
  }

  // ダウンロード
  const handleDownload = () => {
    if (!exportedVideo) return
    const a = document.createElement('a')
    a.href = exportedVideo.videoUrl
    a.download = `cliptrailer-${Date.now()}.mp4`
    a.click()
  }

  // キャプションコピー
  const handleCopyCaption = async () => {
    if (!exportedVideo) return
    await navigator.clipboard.writeText(exportedVideo.caption)
    setCopiedCaption(true)
    toast.success('キャプションをコピーしました')
    setTimeout(() => setCopiedCaption(false), 2000)
  }

  // ハッシュタグコピー
  const handleCopyHashtags = async () => {
    if (!exportedVideo) return
    const text = exportedVideo.hashtags.map(t => `#${t}`).join(' ')
    await navigator.clipboard.writeText(text)
    setCopiedHashtags(true)
    toast.success('ハッシュタグをコピーしました')
    setTimeout(() => setCopiedHashtags(false), 2000)
  }

  // 完了処理
  const handleComplete = () => {
    if (exportedVideo) {
      onComplete(exportedVideo)
    }
  }

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (exportedVideo?.videoUrl) {
        URL.revokeObjectURL(exportedVideo.videoUrl)
      }
    }
  }, [exportedVideo])

  // 完了画面
  if (exportedVideo) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">動画が完成しました！</h2>
        </div>

        {/* 動画プレビュー */}
        <Card>
          <CardContent className="pt-6">
            <video
              ref={videoRef}
              src={exportedVideo.videoUrl}
              controls
              className="w-full rounded-lg"
              style={{ maxHeight: '400px' }}
            />
          </CardContent>
        </Card>

        {/* ダウンロードボタン */}
        <Button onClick={handleDownload} className="w-full" size="lg">
          <Download className="mr-2 h-5 w-5" />
          動画をダウンロード
        </Button>

        {/* キャプション */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">キャプション</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm bg-muted p-3 rounded-lg">{exportedVideo.caption}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCaption}
              className="w-full"
            >
              {copiedCaption ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              {copiedCaption ? 'コピーしました' : 'コピー'}
            </Button>
          </CardContent>
        </Card>

        {/* ハッシュタグ */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">ハッシュタグ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm bg-muted p-3 rounded-lg">
              {exportedVideo.hashtags.map(t => `#${t}`).join(' ')}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyHashtags}
              className="w-full"
            >
              {copiedHashtags ? (
                <Check className="mr-2 h-4 w-4" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              {copiedHashtags ? 'コピーしました' : 'コピー'}
            </Button>
          </CardContent>
        </Card>

        {/* 完了ボタン */}
        <Button onClick={handleComplete} variant="outline" className="w-full">
          新しい動画を作成
        </Button>
      </div>
    )
  }

  // 生成前・生成中の画面
  return (
    <div className="space-y-6">
      {/* 素材確認 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">動画の素材</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">画像</span>
            <span>{images.length}枚</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">音声</span>
            <span>約{voice.duration}秒</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">BGM</span>
            <span>{bgm ? bgm.name : 'なし'}</span>
          </div>
        </CardContent>
      </Card>

      {/* 字幕オプション */}
      <div className="space-y-3">
        <h3 className="font-medium">オプション</h3>
        <button
          onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
          disabled={true} // MVPでは字幕機能は無効
          className={`w-full p-4 rounded-lg border text-left transition-all flex items-center gap-3 opacity-50 cursor-not-allowed ${
            subtitlesEnabled
              ? 'border-primary bg-primary/10'
              : 'border-border'
          }`}
        >
          <Subtitles className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium">字幕を追加</p>
            <p className="text-sm text-muted-foreground">
              （今後のアップデートで対応予定）
            </p>
          </div>
        </button>
      </div>

      {/* 生成中の進捗 */}
      {isGenerating && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{progressMessage}</span>
            </div>
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground text-center">
              {progress}% 完了
            </p>
          </CardContent>
        </Card>
      )}

      {/* 生成ボタン */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            生成中...
          </>
        ) : (
          <>
            <Video className="mr-2 h-5 w-5" />
            動画を生成
          </>
        )}
      </Button>

      {/* 注意事項 */}
      <p className="text-xs text-muted-foreground text-center">
        ※動画生成には数十秒〜数分かかる場合があります
      </p>
    </div>
  )
}

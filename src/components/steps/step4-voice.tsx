'use client'

import { useState, useRef } from 'react'
import { Loader2, RefreshCw, Play, Pause, Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Script } from '@/types/script'
import { VoiceAudio, VoiceType, VOICE_LABELS } from '@/types/voice'
import { generateVoice } from '@/app/actions/voice'

interface Step4VoiceProps {
  script: Script
  onComplete: (voice: VoiceAudio) => void
}

export function Step4Voice({ script, onComplete }: Step4VoiceProps) {
  const [selectedVoice, setSelectedVoice] = useState<VoiceType>('female')
  const [isGenerating, setIsGenerating] = useState(false)
  const [voice, setVoice] = useState<VoiceAudio | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const result = await generateVoice({
        text: script.fullText,
        voiceType: selectedVoice,
      })

      if (result.success && result.voice) {
        setVoice(result.voice)
        toast.success('音声を生成しました')
      } else {
        toast.error(result.error || '音声の生成に失敗しました')
      }
    } catch {
      toast.error('エラーが発生しました')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePlay = () => {
    if (!audioRef.current || !voice) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
  }

  const handleComplete = () => {
    if (!voice) return
    onComplete(voice)
  }

  return (
    <div className="space-y-6">
      {/* 台本プレビュー */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">読み上げる台本</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{script.fullText}</p>
        </CardContent>
      </Card>

      {/* 声の選択 */}
      <div className="space-y-3">
        <h3 className="font-medium">声の種類を選択</h3>
        <div className="flex gap-3">
          {(Object.keys(VOICE_LABELS) as VoiceType[]).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedVoice(type)}
              className={`flex-1 p-4 rounded-lg border text-center transition-all ${
                selectedVoice === type
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Mic className={`w-6 h-6 mx-auto mb-2 ${
                selectedVoice === type ? 'text-primary' : 'text-muted-foreground'
              }`} />
              <p className="font-medium">{VOICE_LABELS[type]}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 生成ボタン */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            生成中...
          </>
        ) : voice ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            再生成
          </>
        ) : (
          <>
            <Mic className="mr-2 h-4 w-4" />
            音声を生成
          </>
        )}
      </Button>

      {/* 音声プレビュー */}
      {voice && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePlay}
                  className="h-12 w-12 rounded-full"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5 ml-0.5" />
                  )}
                </Button>
                <div>
                  <p className="font-medium">{VOICE_LABELS[voice.voiceType]}ボイス</p>
                  <p className="text-sm text-muted-foreground">
                    約{voice.duration}秒
                  </p>
                </div>
              </div>
            </div>
            <audio
              ref={audioRef}
              src={voice.url}
              onEnded={handleAudioEnded}
              className="hidden"
            />
          </CardContent>
        </Card>
      )}

      {/* 確定ボタン */}
      {voice && (
        <Button
          onClick={handleComplete}
          className="w-full"
          size="lg"
        >
          音声を確定して次へ
        </Button>
      )}
    </div>
  )
}

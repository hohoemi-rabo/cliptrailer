'use client'

import { useState, useRef, useEffect } from 'react'
import { Loader2, Play, Pause, Music, VolumeX, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { BGMTrack } from '@/types/bgm'
import { generateBGM } from '@/app/actions/bgm'

interface Step5BGMProps {
  onComplete: (bgm: BGMTrack | null) => void
}

export function Step5BGM({ onComplete }: Step5BGMProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [tracks, setTracks] = useState<BGMTrack[]>([])
  const [selectedTrack, setSelectedTrack] = useState<BGMTrack | null>(null)
  const [noBGM, setNoBGM] = useState(false)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handleGenerateBGM = async () => {
    setIsLoading(true)
    try {
      const result = await generateBGM()

      if (result.success && result.tracks) {
        setTracks(result.tracks)
        toast.success('3曲のBGM候補を取得しました')
      } else {
        toast.error(result.error || 'BGMの取得に失敗しました')
      }
    } catch {
      toast.error('エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectTrack = (track: BGMTrack) => {
    setSelectedTrack(track)
    setNoBGM(false)
  }

  const handleSelectNoBGM = () => {
    setSelectedTrack(null)
    setNoBGM(true)
    // 再生中の音声を停止
    if (audioRef.current) {
      audioRef.current.pause()
      setPlayingId(null)
    }
  }

  const handlePlay = (track: BGMTrack) => {
    if (playingId === track.id) {
      // 停止
      audioRef.current?.pause()
      setPlayingId(null)
    } else {
      // 再生
      if (audioRef.current) {
        audioRef.current.src = track.url
        audioRef.current.play().catch(() => {
          toast.error('BGMファイルが見つかりません。public/bgm/ にファイルを配置してください。')
        })
        setPlayingId(track.id)
      }
    }
  }

  const handleAudioEnded = () => {
    setPlayingId(null)
  }

  const handleComplete = () => {
    if (!noBGM && !selectedTrack) {
      toast.error('BGMを選択するか「BGMなし」を選択してください')
      return
    }
    onComplete(noBGM ? null : selectedTrack)
  }

  // クリーンアップ
  useEffect(() => {
    const audio = audioRef.current
    return () => {
      if (audio) {
        audio.pause()
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* BGM取得ボタン */}
      {tracks.length === 0 && (
        <Button
          onClick={handleGenerateBGM}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              BGM候補を取得中...
            </>
          ) : (
            <>
              <Music className="mr-2 h-4 w-4" />
              BGM候補を取得
            </>
          )}
        </Button>
      )}

      {/* BGM候補リスト */}
      {tracks.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium">BGMを選択</h3>
          <div className="space-y-2">
            {tracks.map((track) => (
              <div
                key={track.id}
                onClick={() => handleSelectTrack(track)}
                className={`w-full p-4 rounded-lg border text-left transition-all flex items-center justify-between cursor-pointer ${
                  selectedTrack?.id === track.id && !noBGM
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      selectedTrack?.id === track.id && !noBGM
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {selectedTrack?.id === track.id && !noBGM && (
                      <Check className="w-3 h-3 text-primary-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{track.name}</p>
                    <p className="text-sm text-muted-foreground">{track.genre}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePlay(track)
                  }}
                >
                  {playingId === track.id ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  <span className="ml-1">試聴</span>
                </Button>
              </div>
            ))}

            {/* BGMなしオプション */}
            <button
              onClick={handleSelectNoBGM}
              className={`w-full p-4 rounded-lg border text-left transition-all flex items-center gap-3 ${
                noBGM
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  noBGM ? 'border-primary bg-primary' : 'border-muted-foreground'
                }`}
              >
                {noBGM && <Check className="w-3 h-3 text-primary-foreground" />}
              </div>
              <div className="flex items-center gap-2">
                <VolumeX className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">BGMなし</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* 隠しオーディオ要素 */}
      <audio ref={audioRef} onEnded={handleAudioEnded} className="hidden" />

      {/* 確定ボタン */}
      {tracks.length > 0 && (
        <Button
          onClick={handleComplete}
          className="w-full"
          size="lg"
          disabled={!selectedTrack && !noBGM}
        >
          {noBGM ? 'BGMなしで次へ' : 'BGMを確定して次へ'}
        </Button>
      )}
    </div>
  )
}

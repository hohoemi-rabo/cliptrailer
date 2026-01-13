'use client'

import { Skeleton } from '@/components/ui/skeleton'

interface VideoPreviewProps {
  images?: string[]
  isLoading?: boolean
}

export function VideoPreview({ images = [], isLoading = false }: VideoPreviewProps) {
  return (
    <div className="w-80 flex-shrink-0 border-l border-border bg-card/50 p-4">
      <h3 className="text-sm font-medium mb-4">プレビュー</h3>

      {/* 縦動画プレビュー (9:16) */}
      <div className="aspect-[9/16] bg-background rounded-lg overflow-hidden border border-border">
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : images.length > 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            {/* TODO: 画像スライドショープレビュー */}
            <span className="text-muted-foreground text-sm">プレビュー表示</span>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-4xl mb-2">📹</div>
              <p className="text-sm">動画プレビュー</p>
              <p className="text-xs mt-1">1080 × 1920</p>
            </div>
          </div>
        )}
      </div>

      {/* 動画情報 */}
      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
        <div className="flex justify-between">
          <span>尺</span>
          <span>15秒</span>
        </div>
        <div className="flex justify-between">
          <span>解像度</span>
          <span>1080×1920</span>
        </div>
        <div className="flex justify-between">
          <span>形式</span>
          <span>MP4</span>
        </div>
      </div>
    </div>
  )
}

export interface ExportedVideo {
  id: string
  videoUrl: string
  thumbnailUrl: string
  caption: string
  hashtags: string[]
  subtitlesEnabled: boolean
  duration: number
  createdAt: Date
}

export interface GenerateCaptionRequest {
  articleTitle: string
  scriptHook: string
}

export interface GenerateCaptionResult {
  success: boolean
  caption?: string
  hashtags?: string[]
  error?: string
}

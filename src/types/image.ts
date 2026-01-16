export type ImageStyle = 'modern' | 'illustration'

export const IMAGE_STYLE_LABELS: Record<ImageStyle, string> = {
  modern: 'モダン・クリーン',
  illustration: 'イラスト風',
}

export const IMAGE_STYLE_DESCRIPTIONS: Record<ImageStyle, string> = {
  modern: 'シンプルで洗練されたデザイン',
  illustration: 'フラットでポップなイラスト調',
}

export interface GeneratedImage {
  id: string
  index: number // 0-3
  url: string
  prompt: string
  isUserUploaded: boolean
  createdAt: Date
}

export interface GenerateImagesRequest {
  scriptHook: string
  scriptBenefit: string
  scriptConclusion: string
  scriptCta: string
  style?: ImageStyle
}

export interface GenerateImageResult {
  success: boolean
  image?: GeneratedImage
  error?: string
}

export interface GenerateAllImagesResult {
  success: boolean
  images?: GeneratedImage[]
  error?: string
}

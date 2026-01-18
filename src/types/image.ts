export type ImageStyle = 'modern' | 'female' | 'pixel' | 'illustration'

export const IMAGE_STYLE_LABELS: Record<ImageStyle, string> = {
  modern: 'マンガ風（男性キャラ）',
  female: 'マンガ風（女性キャラ）',
  pixel: 'ピクセルアート風',
  illustration: 'イラスト風（人物なし）',
}

export const IMAGE_STYLE_DESCRIPTIONS: Record<ImageStyle, string> = {
  modern: 'テック系、プロフェッショナル',
  female: 'クリエイティブ系、スタイリッシュ',
  pixel: 'レトロゲーム風、ドット絵',
  illustration: 'フラットでポップ、抽象的',
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

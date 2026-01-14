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

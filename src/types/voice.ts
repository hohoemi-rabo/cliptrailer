export type VoiceType = 'male' | 'female'

export interface VoiceAudio {
  id: string
  url: string
  voiceType: VoiceType
  duration: number // 秒
  createdAt: Date
}

export interface GenerateVoiceRequest {
  text: string
  voiceType: VoiceType
}

export interface GenerateVoiceResult {
  success: boolean
  voice?: VoiceAudio
  error?: string
}

export const VOICE_LABELS: Record<VoiceType, string> = {
  male: '男性',
  female: '女性',
}

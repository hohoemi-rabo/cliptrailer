export interface BGMTrack {
  id: string
  name: string
  url: string
  duration: number
  genre: string
}

export interface BGMSelection {
  selectedTrack: BGMTrack | null // nullの場合はBGMなし
  candidates: BGMTrack[]
}

export interface GenerateBGMResult {
  success: boolean
  tracks?: BGMTrack[]
  error?: string
}

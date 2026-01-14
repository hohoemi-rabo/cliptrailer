'use server'

import {
  BGMTrack,
  GenerateBGMResult,
} from '@/types/bgm'

// フリーBGMリスト（public/bgm/ に配置）
// ※ファイルを追加したらここにも追記してください
// ※name/genreは曲を聴いてから適宜変更してください
const FREE_BGM_TRACKS: Omit<BGMTrack, 'id'>[] = [
  {
    name: 'BGM 1',
    url: '/bgm/bgm-01.mp3',
    duration: 30,
    genre: 'BGM',
  },
  {
    name: 'BGM 2',
    url: '/bgm/bgm-02.mp3',
    duration: 30,
    genre: 'BGM',
  },
  {
    name: 'BGM 3',
    url: '/bgm/bgm-03.mp3',
    duration: 30,
    genre: 'BGM',
  },
  {
    name: 'BGM 4',
    url: '/bgm/bgm-04.mp3',
    duration: 30,
    genre: 'BGM',
  },
  {
    name: 'BGM 5',
    url: '/bgm/bgm-05.mp3',
    duration: 30,
    genre: 'BGM',
  },
]

// 配列をシャッフル
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export async function generateBGM(): Promise<GenerateBGMResult> {
  try {
    // リストからランダムに3曲を選択
    const shuffled = shuffleArray(FREE_BGM_TRACKS)
    const selected = shuffled.slice(0, 3)

    const tracks: BGMTrack[] = selected.map((track, index) => ({
      ...track,
      id: `bgm-${Date.now()}-${index}`,
    }))

    return { success: true, tracks }
  } catch (error) {
    console.error('BGM selection error:', error)
    return { success: false, error: 'BGMの取得中にエラーが発生しました' }
  }
}

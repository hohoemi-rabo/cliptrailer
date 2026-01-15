'use server'

import {
  BGMTrack,
  GenerateBGMResult,
} from '@/types/bgm'

// BGMリスト（public/bgm/ に配置）
const BGM_TRACKS: Omit<BGMTrack, 'id'>[] = [
  {
    name: '明るい・軽快',
    url: '/bgm/bright.mp3',
    duration: 30,
    genre: 'Bright / Pop',
  },
  {
    name: '落ち着いた・チル',
    url: '/bgm/chill.mp3',
    duration: 30,
    genre: 'Chill / Lo-fi',
  },
  {
    name: 'スタイリッシュ・クール',
    url: '/bgm/stylish.mp3',
    duration: 30,
    genre: 'Stylish / Tech',
  },
]

export async function generateBGM(): Promise<GenerateBGMResult> {
  try {
    // 3曲すべてを返す
    const tracks: BGMTrack[] = BGM_TRACKS.map((track, index) => ({
      ...track,
      id: `bgm-${Date.now()}-${index}`,
    }))

    return { success: true, tracks }
  } catch (error) {
    console.error('BGM selection error:', error)
    return { success: false, error: 'BGMの取得中にエラーが発生しました' }
  }
}

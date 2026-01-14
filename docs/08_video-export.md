# 08. 動画書き出し（Step⑥）

## 概要

画像・音声・BGMを合成して最終的な動画ファイルを生成する。

## 完了条件

- mp4動画が生成・ダウンロードできる
- 字幕ON/OFFが選択できる
- サムネイル画像が生成される
- キャプション・ハッシュタグが生成される

## 技術仕様

| 項目 | 内容 |
|------|------|
| 出力形式 | mp4 |
| 解像度 | 1080×1920（縦動画） |
| 動画の尺 | 15秒固定（MVP） |
| 動画合成 | ffmpeg.wasm（クライアントサイド） |
| 処理方式 | ブラウザ内処理 |

## タスク

- [x] ExportedVideo型定義
- [x] 字幕ON/OFF選択UI（MVP: 機能は無効）
- [x] キャプション自動生成（Gemini API）
- [x] ハッシュタグ自動生成（Gemini API）
- [x] FFmpeg.wasmによる動画合成処理
- [x] 動画生成進捗表示
- [x] 動画ダウンロード機能
- [x] 完了画面の実装
- [x] サムネイル（1枚目の画像を使用）
- [ ] 字幕の動画焼き込み処理（今後対応）
- [ ] 生成失敗時の再生成ボタン

## 実装ファイル

- `src/types/video.ts` - ExportedVideo型定義
- `src/app/actions/caption.ts` - キャプション生成（Server Action）
- `src/components/steps/step6-export.tsx` - 書き出しコンポーネント

## 動画合成フロー（ffmpeg.wasm）

1. FFmpeg.wasmをCDNから読み込み
2. 4枚の画像をFFmpeg仮想ファイルシステムに書き込み
3. 音声ファイル（WAV）を書き込み
4. BGMファイル（MP3）を書き込み（選択時）
5. 画像リストファイルを作成（各画像の表示時間を設定）
6. FFmpegで動画合成
   - 画像をスライドショー化
   - 音声を重ねる
   - BGMをミックス（音量30%）
7. 出力ファイルをBlobとして読み込み
8. キャプション・ハッシュタグを生成
9. 完成画面を表示

## UI設計（完了画面）

```
┌────────────────────────────────────┐
│ 動画が完成しました！                │
├────────────────────────────────────┤
│ [動画プレビュー]                   │
│                                    │
│ [ダウンロード]                     │
├────────────────────────────────────┤
│ キャプション:                      │
│ ┌──────────────────────────────┐  │
│ │ コピー用テキスト...          │  │
│ └──────────────────────────────┘  │
│ [コピー]                           │
├────────────────────────────────────┤
│ ハッシュタグ:                      │
│ #note #TikTok #ショート動画...     │
│ [コピー]                           │
└────────────────────────────────────┘
```

## データ構造

```typescript
interface ExportedVideo {
  id: string
  videoUrl: string
  thumbnailUrl: string
  caption: string
  hashtags: string[]
  subtitlesEnabled: boolean
  duration: number
  createdAt: Date
}

interface GenerateCaptionRequest {
  articleTitle: string
  scriptHook: string
}

interface GenerateCaptionResult {
  success: boolean
  caption?: string
  hashtags?: string[]
  error?: string
}
```

## 使用ライブラリ

- `@ffmpeg/ffmpeg` - FFmpeg.wasmコア
- `@ffmpeg/util` - ユーティリティ関数

## 注意事項

- ffmpeg.wasmはCDNから動的に読み込み（初回のみ）
- ブラウザのメモリを使用するため、大きな動画は注意が必要
- 生成完了後、Blob URLはコンポーネントのアンマウント時に解放

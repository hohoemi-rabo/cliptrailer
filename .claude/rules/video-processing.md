---
globs: src/lib/video/**, src/lib/ffmpeg/**, src/app/api/video/**, **/video/**
---

# 動画処理ルール

## アーキテクチャ

動画生成は処理時間が長いため、非同期処理で実装。

```
ユーザー → Vercel（受付）→ ジョブキュー → 動画処理サーバー → Supabase Storage
```

## FFmpeg基本コマンド

### 画像からスライドショー作成

```bash
ffmpeg -framerate 1/4 -i image%d.png -c:v libx264 -r 30 -pix_fmt yuv420p output.mp4
```

### 音声を動画に追加

```bash
ffmpeg -i video.mp4 -i audio.mp3 -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 output.mp4
```

### BGMをミックス（音量調整）

```bash
ffmpeg -i video.mp4 -i bgm.mp3 -filter_complex "[1:a]volume=0.3[bgm];[0:a][bgm]amix=inputs=2:duration=first" output.mp4
```

### 字幕焼き込み

```bash
ffmpeg -i video.mp4 -vf "subtitles=subs.srt:force_style='FontSize=24'" output.mp4
```

### 縦動画リサイズ（1080x1920）

```bash
ffmpeg -i input.mp4 -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" output.mp4
```

## 動画合成フロー

1. 4枚の画像を取得（Supabase Storage）
2. 音声の長さを取得
3. 各画像の表示時間を計算（音声長 ÷ 4）
4. FFmpegで画像→動画変換
5. 音声を重ねる
6. BGMをミックス（選択時、音量30%程度）
7. 字幕を焼き込み（ON時）
8. 最終mp4を出力
9. Supabase Storageに保存

## 出力仕様

| 項目 | 値 |
|------|-----|
| 形式 | mp4 (H.264) |
| 解像度 | 1080×1920 |
| フレームレート | 30fps |
| 音声 | AAC |
| 動画の尺 | 15秒（MVP） |

## 非同期処理

- Inngest または Trigger.dev を使用
- ジョブ状態: pending → processing → completed / failed
- 完了時にSupabaseのprojectsテーブルを更新
- WebhookまたはRealtimeでフロントに通知

## エラーハンドリング

- FFmpegエラー時はログを記録し、ジョブをfailed状態に
- ユーザーに再生成ボタンを表示
- リトライは最大3回

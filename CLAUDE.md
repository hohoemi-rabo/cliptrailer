# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ClipTrailerは、note.comの記事からショート動画（TikTok、YouTube Shorts、Instagram Reels向け）を自動生成するNext.js 15アプリケーションです。動画の尺は音声の長さ+3秒で自動調整されます。

## Development Commands

```bash
npm run dev      # 開発サーバー起動（Turbopack使用）
npm run build    # プロダクションビルド
npm run lint     # ESLint実行
npm start        # プロダクションサーバー起動
```

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **Backend:** Supabase (Auth, DB, Storage)
- **Video:** ffmpeg.wasm（クライアントサイド）

## Architecture

```
src/
├── app/           # Next.js App Router
├── components/    # UIコンポーネント
├── lib/           # ユーティリティ、API連携
└── types/         # 型定義
```

## Path Aliases

`@/*` → `./src/*`

## Context-Aware Rules

`.claude/rules/` に技術領域別のルールを配置。ファイルを触ると自動ロード。

| ルール | 対象 |
|--------|------|
| `frontend.md` | Next.js, React, shadcn/ui |
| `supabase.md` | 認証, DB, Storage |
| `video-processing.md` | FFmpeg, 動画合成 |
| `api-integration.md` | 外部API連携 |

## 開発チケット

`/docs` 配下にチケットファイルを管理。連番順に開発。

| No | 内容 |
|----|------|
| 00 | プロジェクト初期設定 |
| 01 | 認証機能 |
| 02 | UIレイアウト |
| 03 | URL入力・記事取得 |
| 04 | 台本生成 |
| 05 | 画像生成 |
| 06 | 音声生成 |
| 07 | BGM選択 |
| 08 | 動画書き出し |
| 09 | マイページ |
| 10 | 仕上げ |

## Todo管理ルール

チケット内のタスクはMarkdownチェックボックスで管理。

```markdown
- [ ] 未完了タスク
- [x] 完了タスク
```

## 進捗状況

| No | 内容 | 状態 |
|----|------|------|
| 00 | プロジェクト初期設定 | 完了 |
| 01 | 認証機能 | 完了 |
| 02 | UIレイアウト | 完了 |
| 03 | URL入力・記事取得 | 完了 |
| 04 | 台本生成 | 完了 |
| 05 | 画像生成 | 完了 |
| 06 | 音声生成 | 完了 |
| 07 | BGM選択 | 完了 |
| 08 | 動画書き出し | 完了 |
| 09 | マイページ | 未着手 |
| 10 | 仕上げ | 未着手 |

## 実装詳細

### 台本テンプレート
- **おまかせ（デフォルト）**: AIが記事を分析して最適な構成を判断
- 失敗談 / 成功談 / 開発ストーリー / How-to / レビュー・紹介 / プロダクト宣伝 / 汎用

### 画像生成
- Gemini 3 Pro で4枚生成（hook, benefit, conclusion, cta）
- **スタイル選択**: モダン・クリーン / イラスト風
- 人物・キャラクター除外（プロンプトで制御）
- 失敗対策: 時間差生成（2秒間隔）+ リトライ（最大3回、指数バックオフ）

### BGM
3曲から選択（`public/bgm/`に配置）
- `bright.mp3` - 明るい・軽快
- `chill.mp3` - 落ち着いた・チル
- `stylish.mp3` - スタイリッシュ・クール

### 動画生成
- ffmpeg.wasmでクライアントサイド処理
- 動画尺: 音声の長さ + 3秒
- BGM音量: 30%（フェードアウト付き）
- 字幕: Canvas焼き込み方式（ON/OFF切替可）

## Notes

- MVPフェーズ（PC優先）
- Supabase MCP統合済み

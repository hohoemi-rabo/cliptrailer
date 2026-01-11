# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ClipTrailerは、note.comの記事から15秒のショート動画（TikTok、YouTube Shorts、Instagram Reels向け）を自動生成するNext.js 15アプリケーションです。

## Development Commands

```bash
npm run dev      # 開発サーバー起動（Turbopack使用）
npm run build    # プロダクションビルド
npm run lint     # ESLint実行
npm start        # プロダクションサーバー起動
```

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript (strict mode)
- **Styling:** Tailwind CSS 3.4, Geist fonts
- **Backend:** Supabase (Auth, PostgreSQL, Storage)
- **AI Services:** NanoBananaPro (画像生成), Google Gemini TTS (音声), Mubert (BGM)
- **Video Processing:** FFmpeg (サーバーサイド)

## Architecture

```
src/
└── app/           # Next.js App Router
    ├── layout.tsx # ルートレイアウト（フォント、メタデータ）
    ├── page.tsx   # ホームページ
    └── globals.css # Tailwind設定
```

**システム構成（予定）:**
```
Vercel (Frontend) → Job Queue (Inngest/Trigger.dev) → Video Processing Server → Supabase
```

## Path Aliases

`@/*` は `./src/*` にマッピングされています。

## Key Configurations

- TypeScript: strict mode有効、ES2017ターゲット
- ESLint: next/core-web-vitals + next/typescript
- Tailwind: CSS変数によるダークモード対応

## MVP Workflow (6ステップ)

1. note.com URLから記事取得
2. AI による15秒スクリプト生成
3. 4枚のAI画像生成
4. TTS音声生成（男性/女性選択可）
5. BGM選択（Mubert API）
6. MP4動画出力（1080x1920、字幕・サムネイル・ハッシュタグ付き）

## Next.js 15 App Router ベストプラクティス

### Server Components vs Client Components

**デフォルトはServer Component** - `'use client'`ディレクティブがない限りServer Componentとして扱われる

```tsx
// Server Component（デフォルト）- データ取得、静的コンテンツに最適
export default async function Page() {
  const data = await fetch('https://...')
  return <div>{/* ... */}</div>
}

// Client Component - インタラクティブな要素に使用
'use client'
import { useState } from 'react'
export default function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

**コンポジションパターン:** Server ComponentからClient Componentをインポートして使用。`'use client'`境界は必要最小限に配置してバンドルサイズを最適化。

### データフェッチング戦略

```tsx
// 静的データ（デフォルト、getStaticProps相当）
const data = await fetch('https://...', { cache: 'force-cache' })

// 動的データ（getServerSideProps相当）
const data = await fetch('https://...', { cache: 'no-store' })

// ISR（再検証付き）
const data = await fetch('https://...', { next: { revalidate: 10 } })
```

### Server Actions

```tsx
// フォーム処理
export default function Page() {
  async function createItem(formData: FormData) {
    'use server'
    const name = formData.get('name')
    // データ変更 → revalidatePath/revalidateTag
  }
  return <form action={createItem}>...</form>
}

// バリデーション（Zod推奨）
import { z } from 'zod'
const schema = z.object({ email: z.string().email() })
```

### 特殊ファイル規約

| ファイル | 用途 |
|---------|------|
| `layout.tsx` | 共有UI、ネストされる |
| `page.tsx` | ルートのユニークなUI |
| `loading.tsx` | Suspenseローディング状態 |
| `error.tsx` | エラーバウンダリ |
| `not-found.tsx` | 404 UI |

**レンダリング順序:** layout → template → error → loading → not-found → page

### メタデータ

```tsx
// 静的メタデータ
export const metadata: Metadata = { title: 'ページタイトル' }

// 動的メタデータ
export async function generateMetadata({ params }): Promise<Metadata> {
  return { title: `${params.id}の詳細` }
}
```

## Notes

- 現在はMVPフェーズ（PC最適化優先）
- Supabase MCP統合済み（.mcp.json）

---
globs: src/app/**/*.tsx, src/app/**/*.ts, src/components/**/*.tsx, src/components/**/*.ts
---

# フロントエンド開発ルール

## Next.js 15 App Router

### Server Components vs Client Components

**デフォルトはServer Component** - `'use client'`がない限りServer Component

```tsx
// Server Component（デフォルト）- データ取得、静的コンテンツ
export default async function Page() {
  const data = await fetch('https://...', { cache: 'no-store' })
  return <div>{/* ... */}</div>
}

// Client Component - useState, useEffect, イベントハンドラが必要な場合
'use client'
import { useState } from 'react'
export default function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

**コンポジションパターン:** `'use client'`境界は必要最小限に。Server ComponentからClient Componentをインポートして使用。

### データフェッチング

```tsx
// 静的（デフォルト）
const data = await fetch('https://...', { cache: 'force-cache' })

// 動的（毎回取得）
const data = await fetch('https://...', { cache: 'no-store' })

// ISR（再検証）
const data = await fetch('https://...', { next: { revalidate: 60 } })
```

### Server Actions

```tsx
export default function Page() {
  async function createItem(formData: FormData) {
    'use server'
    const name = formData.get('name')
    // DB操作 → revalidatePath('/path')
  }
  return <form action={createItem}>...</form>
}
```

### 特殊ファイル

| ファイル | 用途 |
|---------|------|
| `layout.tsx` | 共有UI（ネスト） |
| `page.tsx` | ルートUI |
| `loading.tsx` | ローディング |
| `error.tsx` | エラー境界 |
| `not-found.tsx` | 404 |

### メタデータ

```tsx
export const metadata: Metadata = { title: 'ページタイトル' }

// または動的
export async function generateMetadata({ params }): Promise<Metadata> {
  return { title: `${params.id}` }
}
```

## shadcn/ui

- コンポーネントは `npx shadcn@latest add <component>` で追加
- カスタマイズは `components/ui/` 内で直接編集可能
- ダークテーマはCSS変数で管理（globals.css）

## スタイリング

- Tailwind CSSを使用
- カスタムクラスより既存のユーティリティを優先
- レスポンシブはPC優先（MVP）

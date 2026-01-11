---
globs: src/lib/supabase/**, src/app/auth/**, src/app/**/actions.ts, **/supabase/**
---

# Supabase開発ルール

## クライアント設定

```tsx
// src/lib/supabase/client.ts（ブラウザ用）
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// src/lib/supabase/server.ts（Server Component/Action用）
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

## 認証（Google OAuth）

```tsx
// ログイン
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: `${origin}/auth/callback` }
})

// ログアウト
await supabase.auth.signOut()

// セッション取得
const { data: { user } } = await supabase.auth.getUser()
```

## データベース操作

```tsx
// 取得
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('user_id', userId)

// 挿入
const { data, error } = await supabase
  .from('projects')
  .insert({ title, user_id: userId })
  .select()
  .single()

// 更新
const { error } = await supabase
  .from('projects')
  .update({ status: 'completed' })
  .eq('id', projectId)

// 削除
const { error } = await supabase
  .from('projects')
  .delete()
  .eq('id', projectId)
```

## Storage

```tsx
// アップロード
const { data, error } = await supabase.storage
  .from('videos')
  .upload(`${userId}/${fileName}`, file)

// 公開URL取得
const { data } = supabase.storage
  .from('videos')
  .getPublicUrl(filePath)

// 削除
const { error } = await supabase.storage
  .from('videos')
  .remove([filePath])
```

## RLS（Row Level Security）

- 全テーブルでRLSを有効化
- `auth.uid()` でユーザーIDを取得
- ポリシー例：`using (auth.uid() = user_id)`

## 型安全

- `npx supabase gen types typescript` で型生成
- `Database` 型をクライアントに適用

## MCP連携

Supabase MCPが利用可能。マイグレーション、SQL実行、テーブル確認などはMCPツールを使用。

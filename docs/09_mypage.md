# 09. マイページ

## 概要

ユーザーの過去のプロジェクト一覧を表示し、新規作成や再ダウンロードができるページ。

## 完了条件

- 過去のプロジェクト一覧が表示される
- 新規作成ボタンから動画作成を開始できる
- 過去の動画を再ダウンロードできる
- 7日後に自動削除されることが表示される

## タスク

- [ ] マイページレイアウト
- [ ] プロジェクト一覧表示
- [ ] プロジェクトカード（サムネイル、タイトル、作成日）
- [ ] 新規作成ボタン
- [ ] 動画ダウンロードボタン
- [ ] 削除予定日の表示
- [ ] 期限切れプロジェクトの自動削除（Supabase Function）
- [ ] 空状態の表示（プロジェクトがない場合）

## UI設計

```
┌────────────────────────────────────────────────┐
│ マイページ                    [+ 新規作成]     │
├────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│ │ サムネ   │ │ サムネ   │ │ サムネ   │        │
│ ├──────────┤ ├──────────┤ ├──────────┤        │
│ │ タイトル │ │ タイトル │ │ タイトル │        │
│ │ 1/10作成 │ │ 1/9作成  │ │ 1/8作成  │        │
│ │ 残り5日  │ │ 残り4日  │ │ 残り3日  │        │
│ │[DL][削除]│ │[DL][削除]│ │[DL][削除]│        │
│ └──────────┘ └──────────┘ └──────────┘        │
└────────────────────────────────────────────────┘
```

## データ構造

```typescript
interface Project {
  id: string
  userId: string
  title: string
  articleUrl: string | null
  thumbnailUrl: string
  videoUrl: string
  status: 'draft' | 'processing' | 'completed' | 'failed'
  createdAt: Date
  expiresAt: Date
}
```

## Supabaseテーブル設計

```sql
create table projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  article_url text,
  thumbnail_url text,
  video_url text,
  status text default 'draft',
  created_at timestamptz default now(),
  expires_at timestamptz default now() + interval '7 days'
);

-- RLS Policy
alter table projects enable row level security;
create policy "Users can view own projects" on projects
  for select using (auth.uid() = user_id);
```

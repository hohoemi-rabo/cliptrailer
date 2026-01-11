# 01. 認証機能

## 概要

Supabase AuthによるGoogleログイン機能を実装する。

## 完了条件

- Googleログインでユーザー認証ができる
- ログイン状態が維持される
- ログアウトができる
- 未認証ユーザーは保護されたページにアクセスできない

## 技術仕様

| 項目 | 内容 |
|------|------|
| 認証方式 | Google OAuth（Supabase Auth） |
| セッション管理 | Supabase Session |
| 将来対応 | メール/パスワード認証 |

## タスク

- [ ] Supabase Auth設定（Google OAuth）
- [ ] ログインページ作成（/login）
- [ ] 認証コールバック処理（/auth/callback）
- [ ] 認証状態管理（Context/Provider）
- [ ] 保護されたルートのミドルウェア作成
- [ ] ログアウト機能
- [ ] 認証エラーハンドリング

## 画面仕様

### ログイン画面
- Googleログインボタン
- シンプルなデザイン（ロゴ + ボタンのみ）

## 参考

- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)

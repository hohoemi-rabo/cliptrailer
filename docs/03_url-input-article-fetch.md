# 03. URL入力・記事取得（Step①）

## 概要

note.comのURLを入力し、記事の内容を取得する機能を実装する。

## 完了条件

- note.comのURLを入力できる
- 記事のタイトル・本文が取得できる
- 文章の直接貼り付けにも対応
- エラー時に適切なメッセージが表示される

## 技術仕様

| 項目 | 内容 |
|------|------|
| 対応URL | note.com のみ（MVP） |
| バリデーション | note.comドメインチェック |
| 代替入力 | 文章直接貼り付け対応 |
| 取得方法 | Server Action または API Route |

## タスク

- [ ] URL入力フォームコンポーネント
- [ ] note.com URLバリデーション
- [ ] 記事スクレイピング処理（Server Action）
- [ ] 文章直接入力モードの切り替え
- [ ] 取得した記事の表示・確認画面
- [ ] エラーハンドリング
  - 無効なURL
  - 非公開記事
  - 取得失敗
- [ ] ローディング状態の表示

## エラーメッセージ

| エラー種別 | メッセージ |
|-----------|----------|
| 無効なURL | 「note.comのURLを入力してください」 |
| 取得失敗 | 「URLが間違っているか、非公開になっていないか確認してください」 |

## データ構造

```typescript
interface Article {
  url: string
  title: string
  content: string
  author?: string
  publishedAt?: string
}
```

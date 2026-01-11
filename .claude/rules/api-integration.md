---
globs: src/lib/api/**, src/app/api/**/route.ts, src/services/**
---

# 外部API連携ルール

## 画像生成（NanoBananaPro）

gemini-3-pro-image-preview を使用。

```typescript
interface ImageGenerationRequest {
  prompt: string
  aspectRatio: '9:16' // 縦動画用
  count: 4
}

// プロンプト設計
// - 台本の各セクションに対応
// - 統一感のあるスタイル指定
// - 縦構図を明示
```

## 音声生成（Google Gemini 2.5 Flash TTS）

```typescript
interface TTSRequest {
  text: string
  voice: 'male' | 'female'
  language: 'ja-JP'
}

// 注意点
// - 15秒に収まる文字数を事前チェック
// - 句読点で適切な間を入れる
```

## BGM生成（Mubert API）

```typescript
interface MubertRequest {
  theme: string // 記事のテーマから推定
  duration: 15
  intensity: 'low' // ナレーションの邪魔にならない
}

// 3曲候補を取得してユーザーに提示
```

## 台本生成（LLM）

Google Gemini または適切なLLMを使用。

```typescript
interface ScriptGenerationRequest {
  articleContent: string
  template: 'failure' | 'success' | 'development' | 'howto'
}

interface ScriptResponse {
  hookOptions: string[] // 3つのフック案
  benefit: string
  conclusion: string
  cta: string
}
```

## 共通ルール

### 環境変数

```env
# 全てのAPIキーは環境変数で管理
NANOBANANA_API_KEY=
GOOGLE_GEMINI_API_KEY=
MUBERT_API_KEY=
```

### エラーハンドリング

```typescript
try {
  const result = await apiCall()
  return { success: true, data: result }
} catch (error) {
  console.error('API Error:', error)
  return { success: false, error: 'API呼び出しに失敗しました' }
}
```

### リトライ

- 一時的なエラー（5xx, timeout）は最大3回リトライ
- 指数バックオフ（1秒 → 2秒 → 4秒）
- 永続的なエラー（4xx）は即座に失敗を返す

### レート制限

- API制限に注意
- 必要に応じてキューイングを実装
- ユーザーにはローディング状態を適切に表示

### キャッシュ

- 同一リクエストの結果はキャッシュ検討
- BGMは同一テーマで再利用可能

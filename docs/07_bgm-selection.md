# 07. BGM選択（Step⑤）

## 概要

記事のテーマに合ったBGMをAIが提案し、ユーザーが選択する。

## 完了条件

- AIが3曲のBGM候補を提案する
- 各BGMをプレビュー再生できる
- BGMを選択できる（またはBGMなしを選択）
- 選択したBGMが動画に適用される

## 技術仕様

| 項目 | 内容 |
|------|------|
| 提供元 | Mubert API |
| 候補数 | 3曲 |
| BGMなし | 選択可能 |
| 音量 | 固定（ナレーションの邪魔にならないレベル） |

## タスク

- [ ] Mubert API連携
- [ ] テーマに基づくBGM候補取得
- [ ] 3曲のBGM候補表示
- [ ] BGMプレビュー再生機能
- [ ] BGM選択UI
- [ ] 「BGMなし」オプション
- [ ] 選択状態の保存
- [ ] BGMファイルのキャッシュ/保存

## UI設計

```
┌────────────────────────────────────┐
│ BGMを選択してください               │
├────────────────────────────────────┤
│ ○ Upbeat Energy      [▶ 試聴]     │
│ ● Calm Inspiration   [▶ 試聴]     │
│ ○ Modern Tech        [▶ 試聴]     │
│ ○ BGMなし                         │
└────────────────────────────────────┘
```

## データ構造

```typescript
interface BGMTrack {
  id: string
  name: string
  url: string
  duration: number
  genre: string
}

interface BGMSelection {
  selectedTrack: BGMTrack | null // nullの場合はBGMなし
  candidates: BGMTrack[]
}
```

## Mubert API連携

- テーマ/ムードを指定してBGM生成
- 15秒の動画に適した長さ
- 商用利用可能なライセンス確認

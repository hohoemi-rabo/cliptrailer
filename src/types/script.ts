export type TemplateType = 'auto' | 'failure' | 'success' | 'development' | 'howto' | 'review' | 'general'

export interface Script {
  template: TemplateType
  hook: string
  hookOptions: string[]
  benefit: string
  conclusion: string
  cta: string
  fullText: string
}

export interface GenerateScriptRequest {
  articleTitle: string
  articleContent: string
  template: TemplateType
}

export interface GenerateScriptResult {
  success: boolean
  script?: Script
  error?: string
}

export const TEMPLATE_LABELS: Record<TemplateType, string> = {
  auto: 'おまかせ',
  failure: '失敗談',
  success: '成功談',
  development: '開発ストーリー',
  howto: 'How-to',
  review: 'レビュー・紹介',
  general: '汎用',
}

export const TEMPLATE_DESCRIPTIONS: Record<TemplateType, string> = {
  auto: 'AIが記事に最適な構成を判断',
  failure: '失敗から学んだ教訓を伝える',
  success: '成功体験とそのポイントを共有',
  development: '開発過程やプロセスを紹介',
  howto: '具体的なやり方・手順を解説',
  review: '商品や作品の魅力をポイント解説',
  general: 'どんな記事にも使える万能型',
}

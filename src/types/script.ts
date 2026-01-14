export type TemplateType = 'failure' | 'success' | 'development' | 'howto'

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
  failure: '失敗談',
  success: '成功談',
  development: '開発ストーリー',
  howto: 'How-to',
}

export const TEMPLATE_DESCRIPTIONS: Record<TemplateType, string> = {
  failure: '失敗から学んだ教訓を伝える',
  success: '成功体験とそのポイントを共有',
  development: '開発過程やプロセスを紹介',
  howto: '具体的なやり方・手順を解説',
}

'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  GenerateCaptionRequest,
  GenerateCaptionResult,
} from '@/types/video'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')

export async function generateCaption(
  request: GenerateCaptionRequest
): Promise<GenerateCaptionResult> {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return { success: false, error: 'API設定エラー' }
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `あなたはSNSマーケターです。以下のショート動画用のキャプションとハッシュタグを生成してください。

【記事タイトル】
${request.articleTitle}

【動画のフック】
${request.scriptHook}

【出力形式】
以下のJSON形式で出力してください。他の文章は一切不要です。

{
  "caption": "SNS投稿用キャプション（100-150文字、絵文字を適度に使用）",
  "hashtags": ["ハッシュタグ1", "ハッシュタグ2", "ハッシュタグ3", "ハッシュタグ4", "ハッシュタグ5"]
}

【重要な制約】
- キャプションは視聴者の興味を引く内容
- ハッシュタグは5個（#は含めない）
- 日本語で作成
- TikTok/Instagram/YouTube Shortsに適した形式`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // JSONを抽出
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { success: false, error: 'キャプションの生成に失敗しました' }
    }

    const parsed = JSON.parse(jsonMatch[0])

    return {
      success: true,
      caption: parsed.caption || '',
      hashtags: parsed.hashtags || [],
    }
  } catch (error) {
    console.error('Caption generation error:', error)
    return { success: false, error: 'キャプションの生成中にエラーが発生しました' }
  }
}

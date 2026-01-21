'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  GenerateScriptRequest,
  GenerateScriptResult,
  Script,
  TemplateType,
  TEMPLATE_LABELS,
} from '@/types/script'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')

const TEMPLATE_PROMPTS: Record<TemplateType, string> = {
  auto: `記事の内容を分析し、最も適切な構成を自動で判断してください。
以下のどのパターンが最適か考え、それに合わせた構成にしてください:
- 失敗談: 失敗から学んだ話
- 成功談: 成功体験を共有する話
- 開発ストーリー: 何かを作った過程の話
- How-to: やり方を教える話
- レビュー・紹介: 商品や作品の魅力を伝える話
- プロダクト宣伝: サービスやアプリの利用を促す話
- 汎用: 上記に当てはまらない場合

選んだパターンに合わせて:
- フック: 視聴者の興味を引く衝撃的な一言（言い切り形式）
- ベネフィット: 記事を読むと得られる価値
- 結論: 伝えたいメインメッセージ
- CTA: 動画への反応を促す（「共感したらいいね」「感想コメントで教えて」等）`,

  failure: `失敗談として構成してください。
- フック: 失敗や挫折を暗示する衝撃的な一言（言い切り形式）
- ベネフィット: その失敗から得た教訓や気づき
- 結論: 失敗を乗り越えた結果や学び
- CTA: 共感・応援を促す（「応援いいね待ってます」「同じ経験ある人コメントで」等）`,

  success: `成功談として構成してください。
- フック: 驚きの成果や結果を示す一言（言い切り形式）
- ベネフィット: 成功に至った具体的なポイント
- 結論: 成功の本質や再現性
- CTA: 反応を促す（「参考になったらいいね」「質問はコメントで」等）`,

  development: `開発ストーリーとして構成してください。
- フック: 開発のきっかけや課題を示す一言（言い切り形式）
- ベネフィット: 開発過程での工夫や発見
- 結論: 完成したものの価値
- CTA: 応援・意見を促す（「応援いいねお願いします」「欲しい機能コメントで」等）`,

  howto: `How-toとして構成してください。
- フック: 解決できる問題や得られる結果（言い切り形式）
- ベネフィット: 具体的な手順やポイント（簡潔に）
- 結論: 実践した結果のイメージ
- CTA: 反応を促す（「役立ったらいいね」「他に知りたいことコメントで」等）`,

  review: `レビュー・紹介として構成してください。
- フック: 商品/作品名と一言評価（「これ、正直すごかった」等、言い切り形式）
- ベネフィット: 良かったポイント（2-3個を簡潔に）
- 結論: 実際の使用感と正直な感想
- CTA: 反応を促す（「気になったらいいね」「使ったことある人コメントで」等）`,

  product: `プロダクト宣伝として構成してください。
- フック: 解決する課題や「こんなの作りました」という興味を引く一言（言い切り形式）
- ベネフィット: サービス/アプリの特徴・できること（2-3個）
- 結論: 使うとどう変わるか、どんな体験ができるか
- CTA: 反応・意見を促す（「気になったらいいね」「欲しい機能あればコメントで」等）`,

  general: `汎用的な紹介として構成してください。
- フック: 記事のテーマについて興味を引く一言（言い切り形式）
- ベネフィット: この記事を読むとわかること・得られること
- 結論: 記事のメインメッセージやポイント
- CTA: 反応を促す（「面白かったらいいね」「感想コメントで教えて」等）`,
}

export async function generateScript(
  request: GenerateScriptRequest
): Promise<GenerateScriptResult> {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return { success: false, error: 'API設定エラー: GOOGLE_GEMINI_API_KEY が設定されていません' }
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `あなたは15秒ショート動画の台本ライターです。
以下の記事から、TikTok/YouTube Shorts/Instagram Reels向けの15秒動画台本を作成してください。

【記事タイトル】
${request.articleTitle}

【記事内容】
${request.articleContent.slice(0, 3000)}

【テンプレート: ${TEMPLATE_LABELS[request.template]}】
${TEMPLATE_PROMPTS[request.template]}

【出力形式】
以下のJSON形式で出力してください。他の文章は一切不要です。

{
  "hookOptions": ["フック案1", "フック案2", "フック案3"],
  "benefit": "ベネフィット部分（40-60文字程度）",
  "conclusion": "結論部分（30-40文字程度）",
  "cta": "CTA部分（20文字以内）"
}

【重要な制約】
- 日本語で作成
- フックは3つの案を提示（各15文字以内、インパクト重視）
- フックは必ず「言い切り形式」にする（疑問形「？」は使わない）
- フックは「衝撃の事実」「具体的な数字」「ネガティブな要素」を含めると効果的
- 全体で15秒（約150-180文字）で読める長さ
- 視聴者の興味を引く表現を使用
- 専門用語は避け、わかりやすく
- CTAは外部サイトへの誘導ではなく、動画への「いいね」「コメント」を促す`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // JSONを抽出（マークダウンコードブロック対応）
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { success: false, error: '台本の生成に失敗しました。再度お試しください。' }
    }

    const parsed = JSON.parse(jsonMatch[0])

    // バリデーション
    if (!parsed.hookOptions || !Array.isArray(parsed.hookOptions) || parsed.hookOptions.length < 3) {
      return { success: false, error: 'フック案の生成に失敗しました。再度お試しください。' }
    }

    const script: Script = {
      template: request.template,
      hook: parsed.hookOptions[0], // デフォルトは最初のフック
      hookOptions: parsed.hookOptions.slice(0, 3),
      benefit: parsed.benefit || '',
      conclusion: parsed.conclusion || '',
      cta: parsed.cta || '',
      fullText: `${parsed.hookOptions[0]}\n\n${parsed.benefit}\n\n${parsed.conclusion}\n\n${parsed.cta}`,
    }

    return { success: true, script }
  } catch (error) {
    console.error('Script generation error:', error)
    if (error instanceof SyntaxError) {
      return { success: false, error: 'AI応答の解析に失敗しました。再度お試しください。' }
    }
    return { success: false, error: '台本の生成中にエラーが発生しました。' }
  }
}

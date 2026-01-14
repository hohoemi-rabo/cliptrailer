'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  GeneratedImage,
  GenerateImagesRequest,
  GenerateImageResult,
  GenerateAllImagesResult,
} from '@/types/image'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')

// 各セクションに対応するプロンプトを生成
function generatePromptForSection(
  section: 'hook' | 'benefit' | 'conclusion' | 'cta',
  content: string
): string {
  const baseStyle = `
縦長のショート動画用画像（9:16アスペクト比）。
モダンでクリーンなデザイン、鮮やかな色使い。
テキストは含めない、ビジュアルのみ。
プロフェッショナルで魅力的な雰囲気。
`.trim()

  const sectionStyles: Record<string, string> = {
    hook: '注目を引く、インパクトのある構図。ドラマチックな照明。',
    benefit: '明るく前向きな雰囲気。価値や可能性を感じさせる。',
    conclusion: '達成感や満足感を表現。安定感のある構図。',
    cta: '行動を促す、エネルギッシュな雰囲気。方向性を示す要素。',
  }

  return `${baseStyle}
${sectionStyles[section]}
コンセプト: ${content.slice(0, 100)}`
}

// 単一画像を生成
export async function generateSingleImage(
  section: 'hook' | 'benefit' | 'conclusion' | 'cta',
  content: string,
  index: number
): Promise<GenerateImageResult> {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return { success: false, error: 'API設定エラー: GOOGLE_GEMINI_API_KEY が設定されていません' }
    }

    const prompt = generatePromptForSection(section, content)

    // Gemini 3 Pro (画像生成対応)を使用
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-pro-image-preview',
    })

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['image', 'text'],
      } as Record<string, unknown>,
    })

    const response = result.response
    const parts = response.candidates?.[0]?.content?.parts

    if (!parts || parts.length === 0) {
      return { success: false, error: '画像の生成に失敗しました' }
    }

    // 画像データを探す
    for (const part of parts) {
      if ('inlineData' in part && part.inlineData) {
        const imageData = part.inlineData
        const image: GeneratedImage = {
          id: `img-${Date.now()}-${index}`,
          index,
          url: `data:${imageData.mimeType};base64,${imageData.data}`,
          prompt,
          isUserUploaded: false,
          createdAt: new Date(),
        }
        return { success: true, image }
      }
    }

    return { success: false, error: '画像データが見つかりませんでした' }
  } catch (error) {
    console.error('Image generation error:', error)
    return { success: false, error: '画像の生成中にエラーが発生しました' }
  }
}

// 4枚の画像を一括生成
export async function generateAllImages(
  request: GenerateImagesRequest
): Promise<GenerateAllImagesResult> {
  try {
    const sections: Array<{ key: 'hook' | 'benefit' | 'conclusion' | 'cta'; content: string }> = [
      { key: 'hook', content: request.scriptHook },
      { key: 'benefit', content: request.scriptBenefit },
      { key: 'conclusion', content: request.scriptConclusion },
      { key: 'cta', content: request.scriptCta },
    ]

    const images: GeneratedImage[] = []

    // 順番に生成（API制限を考慮）
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i]
      const result = await generateSingleImage(section.key, section.content, i)

      if (result.success && result.image) {
        images.push(result.image)
      } else {
        // 失敗した場合はプレースホルダーを追加
        images.push({
          id: `placeholder-${i}`,
          index: i,
          url: '', // 空のURL（UIでプレースホルダー表示）
          prompt: generatePromptForSection(section.key, section.content),
          isUserUploaded: false,
          createdAt: new Date(),
        })
      }
    }

    return { success: true, images }
  } catch (error) {
    console.error('Generate all images error:', error)
    return { success: false, error: '画像の一括生成に失敗しました' }
  }
}

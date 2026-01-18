'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  GeneratedImage,
  GenerateImagesRequest,
  GenerateImageResult,
  GenerateAllImagesResult,
  ImageStyle,
} from '@/types/image'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')

// 待機用ユーティリティ
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// スタイル別のベースプロンプト
const STYLE_PROMPTS: Record<ImageStyle, string> = {
  modern: `
縦長のショート動画用画像（9:16アスペクト比）。
日本のマンガ・アニメ調のイラストスタイル。
テック系・ビジネス系のサムネイル画像。
鮮やかでカラフルな配色、グラデーション背景。
プロフェッショナルだけど親しみやすい雰囲気。
テキストや文字は含めない、ビジュアルのみ。
メインの人物キャラクター（30-50代の日本人男性、眼鏡をかけていることもある）を中央に配置。
背景にはPC、コード、AI、テクノロジー要素を含める。
`.trim(),
  female: `
縦長のショート動画用画像（9:16アスペクト比）。
日本のマンガ・アニメ調のイラストスタイル。
クリエイティブ系・スタートアップ系のサムネイル画像。
パステル調やソフトなグラデーション背景。
スタイリッシュでトレンド感のある雰囲気。
テキストや文字は含めない、ビジュアルのみ。
メインの人物キャラクター（20-30代の日本人女性、眼鏡をかけていることもある）を中央に配置。
背景にはPC、デザイン、SNS、クリエイティブ要素を含める。
`.trim(),
  pixel: `
縦長のショート動画用画像（9:16アスペクト比）。
ピクセルアート・ドット絵スタイル。
レトロゲーム風のかわいいちびキャラクター。
サイバー・デジタルな背景、青いネオングリッド。
8bit/16bitゲームの雰囲気。
テキストや文字は含めない、ビジュアルのみ。
メインのピクセルキャラクターを中央に配置。
背景にはデジタル空間、グリッド、テクノロジー要素を含める。
`.trim(),
  illustration: `
縦長のショート動画用画像（9:16アスペクト比）。
フラットデザインのイラスト風、ポップで明るい色使い。
テキストは含めない、ビジュアルのみ。
シンプルでかわいらしい雰囲気、2Dイラストスタイル。
人物、キャラクター、顔、手、体は絶対に含めないでください。
アイコン、シンボル、抽象的な図形、風景イラストのみで表現してください。
`.trim(),
}

// 各セクションに対応するプロンプトを生成
function generatePromptForSection(
  section: 'hook' | 'benefit' | 'conclusion' | 'cta',
  content: string,
  style: ImageStyle = 'modern'
): string {
  const baseStyle = STYLE_PROMPTS[style]

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

// 単一画像を生成（内部用・リトライなし）
async function generateSingleImageInternal(
  section: 'hook' | 'benefit' | 'conclusion' | 'cta',
  content: string,
  index: number,
  style: ImageStyle = 'modern'
): Promise<GenerateImageResult> {
  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    return { success: false, error: 'API設定エラー: GOOGLE_GEMINI_API_KEY が設定されていません' }
  }

  const prompt = generatePromptForSection(section, content, style)

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
}

// 単一画像を生成（リトライ付き）
export async function generateSingleImage(
  section: 'hook' | 'benefit' | 'conclusion' | 'cta',
  content: string,
  index: number,
  style: ImageStyle = 'modern',
  maxRetries: number = 3
): Promise<GenerateImageResult> {
  let lastError = ''

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await generateSingleImageInternal(section, content, index, style)

      if (result.success) {
        return result
      }

      lastError = result.error || '不明なエラー'
      console.log(`画像生成失敗 (試行 ${attempt + 1}/${maxRetries}): ${lastError}`)

      // 最後の試行でなければ待機してリトライ
      if (attempt < maxRetries - 1) {
        const waitTime = Math.pow(2, attempt) * 1000 // 指数バックオフ: 1秒, 2秒, 4秒
        console.log(`${waitTime / 1000}秒後にリトライします...`)
        await sleep(waitTime)
      }
    } catch (error) {
      console.error(`画像生成エラー (試行 ${attempt + 1}/${maxRetries}):`, error)
      lastError = '画像の生成中にエラーが発生しました'

      if (attempt < maxRetries - 1) {
        const waitTime = Math.pow(2, attempt) * 1000
        await sleep(waitTime)
      }
    }
  }

  return { success: false, error: `${maxRetries}回試行しましたが失敗しました: ${lastError}` }
}

// 4枚の画像を一括生成（時間差・リトライ付き）
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
    const DELAY_BETWEEN_IMAGES = 2000 // 画像間の待機時間（2秒）
    const style = request.style || 'modern'

    // 順番に生成（時間差 + リトライで失敗を最小化）
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i]

      // 2枚目以降は待機時間を入れる
      if (i > 0) {
        console.log(`次の画像生成まで${DELAY_BETWEEN_IMAGES / 1000}秒待機...`)
        await sleep(DELAY_BETWEEN_IMAGES)
      }

      console.log(`画像 ${i + 1}/4 (${section.key}) を生成中... スタイル: ${style}`)
      const result = await generateSingleImage(section.key, section.content, i, style)

      if (result.success && result.image) {
        console.log(`画像 ${i + 1}/4 生成成功`)
        images.push(result.image)
      } else {
        console.log(`画像 ${i + 1}/4 生成失敗: ${result.error}`)
        // 失敗した場合はプレースホルダーを追加
        images.push({
          id: `placeholder-${i}`,
          index: i,
          url: '', // 空のURL（UIでプレースホルダー表示）
          prompt: generatePromptForSection(section.key, section.content, style),
          isUserUploaded: false,
          createdAt: new Date(),
        })
      }
    }

    const successCount = images.filter((img) => img.url).length
    console.log(`画像生成完了: ${successCount}/4 枚成功`)

    return { success: true, images }
  } catch (error) {
    console.error('Generate all images error:', error)
    return { success: false, error: '画像の一括生成に失敗しました' }
  }
}

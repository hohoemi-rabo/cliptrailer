'use server'

import { GoogleGenAI } from '@google/genai'
import {
  VoiceAudio,
  VoiceType,
  GenerateVoiceRequest,
  GenerateVoiceResult,
} from '@/types/voice'

// 声の種類に対応するGemini音声名
const VOICE_NAMES: Record<VoiceType, string> = {
  male: 'Orus',     // 男性的な声
  female: 'Kore',   // 女性的な声
}

// PCMデータをWAVフォーマットに変換
function createWavFromPcm(pcmData: Buffer, sampleRate = 24000, channels = 1, bitDepth = 16): Buffer {
  const byteRate = sampleRate * channels * (bitDepth / 8)
  const blockAlign = channels * (bitDepth / 8)
  const dataSize = pcmData.length
  const headerSize = 44
  const fileSize = headerSize + dataSize - 8

  const header = Buffer.alloc(headerSize)

  // RIFF header
  header.write('RIFF', 0)
  header.writeUInt32LE(fileSize, 4)
  header.write('WAVE', 8)

  // fmt chunk
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16) // fmt chunk size
  header.writeUInt16LE(1, 20)  // audio format (PCM)
  header.writeUInt16LE(channels, 22)
  header.writeUInt32LE(sampleRate, 24)
  header.writeUInt32LE(byteRate, 28)
  header.writeUInt16LE(blockAlign, 32)
  header.writeUInt16LE(bitDepth, 34)

  // data chunk
  header.write('data', 36)
  header.writeUInt32LE(dataSize, 40)

  return Buffer.concat([header, pcmData])
}

export async function generateVoice(
  request: GenerateVoiceRequest
): Promise<GenerateVoiceResult> {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return { success: false, error: 'API設定エラー: GOOGLE_GEMINI_API_KEY が設定されていません' }
    }

    const voiceName = VOICE_NAMES[request.voiceType]
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY })

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [
        {
          parts: [
            {
              text: `以下のテキストを自然な日本語で読み上げてください。

${request.text}`,
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    })

    const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data

    if (!data) {
      return { success: false, error: '音声データが見つかりませんでした' }
    }

    // PCMデータをWAVに変換
    const pcmBuffer = Buffer.from(data, 'base64')
    const wavBuffer = createWavFromPcm(pcmBuffer)
    const wavBase64 = wavBuffer.toString('base64')

    // 音声の長さを計算（PCMデータサイズから: 24000Hz, 16bit, mono）
    const durationSeconds = pcmBuffer.length / (24000 * 2)

    const voice: VoiceAudio = {
      id: `voice-${Date.now()}`,
      url: `data:audio/wav;base64,${wavBase64}`,
      voiceType: request.voiceType,
      duration: Math.round(durationSeconds),
      createdAt: new Date(),
    }

    return { success: true, voice }
  } catch (error) {
    console.error('Voice generation error:', error)
    return { success: false, error: '音声の生成中にエラーが発生しました' }
  }
}

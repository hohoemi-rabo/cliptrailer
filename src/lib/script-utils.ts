import { Script } from '@/types/script'

// フック選択時にfullTextを更新
export function updateScriptWithHook(script: Script, selectedHook: string): Script {
  return {
    ...script,
    hook: selectedHook,
    fullText: `${selectedHook}\n\n${script.benefit}\n\n${script.conclusion}\n\n${script.cta}`,
  }
}

// 文字数から秒数を概算（1秒あたり約10-12文字）
export function estimateDuration(text: string): number {
  const charCount = text.replace(/\s/g, '').length
  return Math.round(charCount / 10)
}

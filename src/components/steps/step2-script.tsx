'use client'

import { useState } from 'react'
import { Loader2, RefreshCw, Sparkles, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Article } from '@/types/article'
import {
  Script,
  TemplateType,
  TEMPLATE_LABELS,
  TEMPLATE_DESCRIPTIONS,
} from '@/types/script'
import { generateScript } from '@/app/actions/script'
import { updateScriptWithHook, estimateDuration } from '@/lib/script-utils'

interface Step2ScriptProps {
  article: Article
  onComplete: (script: Script) => void
}

export function Step2Script({ article, onComplete }: Step2ScriptProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [script, setScript] = useState<Script | null>(null)
  const [editedFullText, setEditedFullText] = useState('')

  const handleGenerate = async () => {
    if (!selectedTemplate) {
      toast.error('テンプレートを選択してください')
      return
    }

    setIsGenerating(true)
    try {
      const result = await generateScript({
        articleTitle: article.title,
        articleContent: article.content,
        template: selectedTemplate,
      })

      if (result.success && result.script) {
        setScript(result.script)
        setEditedFullText(result.script.fullText)
        toast.success('台本を生成しました')
      } else {
        toast.error(result.error || '台本の生成に失敗しました')
      }
    } catch {
      toast.error('エラーが発生しました')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleHookSelect = (hook: string) => {
    if (!script) return
    const updated = updateScriptWithHook(script, hook)
    setScript(updated)
    setEditedFullText(updated.fullText)
  }

  const handleTextChange = (value: string) => {
    setEditedFullText(value)
  }

  const handleComplete = () => {
    if (!script) return
    const finalScript: Script = {
      ...script,
      fullText: editedFullText,
    }
    onComplete(finalScript)
  }

  const charCount = editedFullText.replace(/\s/g, '').length
  const estimatedSeconds = estimateDuration(editedFullText)
  const isOverLimit = estimatedSeconds > 18

  return (
    <div className="space-y-6">
      {/* 記事情報 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">取得した記事</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium">{article.title}</p>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {article.content.slice(0, 150)}...
          </p>
        </CardContent>
      </Card>

      {/* テンプレート選択 */}
      <div className="space-y-3">
        <h3 className="font-medium">テンプレートを選択</h3>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(TEMPLATE_LABELS) as TemplateType[]).map((template) => (
            <button
              key={template}
              onClick={() => setSelectedTemplate(template)}
              className={`p-4 rounded-lg border text-left transition-all ${
                selectedTemplate === template
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <p className="font-medium">{TEMPLATE_LABELS[template]}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {TEMPLATE_DESCRIPTIONS[template]}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 生成ボタン */}
      <Button
        onClick={handleGenerate}
        disabled={!selectedTemplate || isGenerating}
        className="w-full"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            生成中...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            AIで台本を生成
          </>
        )}
      </Button>

      {/* 生成結果 */}
      {script && (
        <div className="space-y-6">
          {/* フック選択 */}
          <div className="space-y-3">
            <h3 className="font-medium">フックを選択（3つの案）</h3>
            <div className="space-y-2">
              {script.hookOptions.map((hook, index) => (
                <button
                  key={index}
                  onClick={() => handleHookSelect(hook)}
                  className={`w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3 ${
                    script.hook === hook
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      script.hook === hook
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {script.hook === hook && (
                      <Check className="w-3 h-3 text-primary-foreground" />
                    )}
                  </div>
                  <span>{hook}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 台本編集 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">台本を編集</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                再生成
              </Button>
            </div>
            <Textarea
              value={editedFullText}
              onChange={(e) => handleTextChange(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {charCount}文字
              </span>
              <span className={isOverLimit ? 'text-destructive' : 'text-muted-foreground'}>
                約{estimatedSeconds}秒 {isOverLimit && '（15秒を超えています）'}
              </span>
            </div>
          </div>

          {/* 確定ボタン */}
          <Button
            onClick={handleComplete}
            className="w-full"
            size="lg"
            disabled={charCount === 0}
          >
            台本を確定して次へ
          </Button>
        </div>
      )}
    </div>
  )
}

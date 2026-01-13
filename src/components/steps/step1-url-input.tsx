'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fetchArticle } from '@/app/actions/article'
import { Article } from '@/types/article'
import { toast } from 'sonner'

interface Step1UrlInputProps {
  onComplete: (article: Article) => void
}

export function Step1UrlInput({ onComplete }: Step1UrlInputProps) {
  const [url, setUrl] = useState('')
  const [directText, setDirectText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [inputMode, setInputMode] = useState<'url' | 'text'>('url')

  const handleFetchArticle = async () => {
    if (!url.trim()) {
      toast.error('URLを入力してください')
      return
    }

    setIsLoading(true)
    try {
      const result = await fetchArticle(url)

      if (result.success && result.article) {
        toast.success('記事を取得しました')
        onComplete(result.article)
      } else {
        toast.error(result.error || '記事の取得に失敗しました')
      }
    } catch {
      toast.error('予期せぬエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDirectTextSubmit = () => {
    if (!directText.trim()) {
      toast.error('文章を入力してください')
      return
    }

    // 最初の行をタイトルとして扱う
    const lines = directText.trim().split('\n')
    const title = lines[0] || '無題'
    const content = lines.slice(1).join('\n').trim() || directText

    const article: Article = {
      url: '',
      title,
      content,
    }

    toast.success('文章を読み込みました')
    onComplete(article)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 1: 記事を取得</CardTitle>
        <CardDescription>
          note.comの記事URLを入力するか、文章を直接貼り付けてください
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'url' | 'text')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="url">URL入力</TabsTrigger>
            <TabsTrigger value="text">文章貼り付け</TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4">
            <div>
              <Input
                placeholder="https://note.com/username/n/xxxxxxxx"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-2">
                note.comの公開記事URLを入力してください
              </p>
            </div>
            <Button
              onClick={handleFetchArticle}
              disabled={isLoading || !url.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  取得中...
                </>
              ) : (
                '記事を取得'
              )}
            </Button>
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div>
              <Textarea
                placeholder="1行目: タイトル&#10;2行目以降: 本文を入力してください"
                value={directText}
                onChange={(e) => setDirectText(e.target.value)}
                className="min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground mt-2">
                1行目がタイトル、2行目以降が本文として扱われます
              </p>
            </div>
            <Button
              onClick={handleDirectTextSubmit}
              disabled={!directText.trim()}
              className="w-full"
            >
              文章を読み込む
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin h-4 w-4 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

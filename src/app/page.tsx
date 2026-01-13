import Link from 'next/link'
import { Header } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">ショート動画を作成</h1>
            <p className="text-muted-foreground">
              note記事から15秒のショート動画を自動生成します
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>新しい動画を作成</CardTitle>
              <CardDescription>
                note.comの記事URLを入力して、TikTok/YouTube Shorts/Instagram Reels向けの動画を生成
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="w-full">
                <Link href="/create">
                  動画を作成する
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

'use server'

import { FetchArticleResult } from '@/types/article'

// note.com URLのバリデーション
function isValidNoteUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.hostname === 'note.com' && parsedUrl.pathname.includes('/n/')
  } catch {
    return false
  }
}

// HTMLから記事情報を抽出
function extractArticleFromHtml(html: string): { title: string; content: string; author?: string } | null {
  try {
    // タイトルを抽出（og:titleまたはtitleタグ）
    const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i)
    const titleTagMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
    const title = ogTitleMatch?.[1] || titleTagMatch?.[1] || ''

    // 著者を抽出
    const authorMatch = html.match(/<meta[^>]*name="author"[^>]*content="([^"]*)"[^>]*>/i)
    const author = authorMatch?.[1]

    // 記事本文を抽出（note-common-styles__textnote-body クラスを探す）
    // note.comの記事本文はJSON-LDに含まれていることが多い
    const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i)
    let content = ''

    if (jsonLdMatch) {
      try {
        const jsonLd = JSON.parse(jsonLdMatch[1])
        if (jsonLd.articleBody) {
          content = jsonLd.articleBody
        } else if (jsonLd.description) {
          content = jsonLd.description
        }
      } catch {
        // JSON解析エラーは無視
      }
    }

    // JSON-LDから取得できなかった場合は、メタディスクリプションを使用
    if (!content) {
      const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i)
      const ogDescMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i)
      content = ogDescMatch?.[1] || descMatch?.[1] || ''
    }

    // 本文が空の場合はnoteの記事本文部分を抽出（フォールバック）
    if (!content) {
      // note-common-styles__textnote-body クラスの内容を取得
      const bodyMatch = html.match(/<div[^>]*class="[^"]*note-common-styles__textnote-body[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
      if (bodyMatch) {
        // HTMLタグを除去
        content = bodyMatch[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      }
    }

    if (!title && !content) {
      return null
    }

    return { title: title.trim(), content: content.trim(), author }
  } catch {
    return null
  }
}

export async function fetchArticle(url: string): Promise<FetchArticleResult> {
  // URLバリデーション
  if (!url || url.trim() === '') {
    return { success: false, error: 'URLを入力してください' }
  }

  if (!isValidNoteUrl(url)) {
    return { success: false, error: 'note.comのURLを入力してください' }
  }

  try {
    // 記事を取得
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: 'URLが間違っているか、非公開になっていないか確認してください' }
      }
      return { success: false, error: '記事の取得に失敗しました' }
    }

    const html = await response.text()
    const extracted = extractArticleFromHtml(html)

    if (!extracted) {
      return { success: false, error: '記事の内容を取得できませんでした' }
    }

    return {
      success: true,
      article: {
        url,
        title: extracted.title,
        content: extracted.content,
        author: extracted.author,
      },
    }
  } catch (error) {
    console.error('Article fetch error:', error)
    return { success: false, error: 'URLが間違っているか、非公開になっていないか確認してください' }
  }
}

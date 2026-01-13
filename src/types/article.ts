export interface Article {
  url: string
  title: string
  content: string
  author?: string
  publishedAt?: string
}

export interface FetchArticleResult {
  success: boolean
  article?: Article
  error?: string
}

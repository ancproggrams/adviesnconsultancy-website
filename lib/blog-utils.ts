

import { BlogPost, BlogSearchParams } from './types'

export class BlogUtils {
  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  static extractExcerpt(content: string, maxLength: number = 160): string {
    // Remove HTML tags and get plain text
    const plainText = content.replace(/<[^>]*>/g, '')
    
    if (plainText.length <= maxLength) {
      return plainText
    }
    
    const truncated = plainText.substring(0, maxLength)
    const lastSpaceIndex = truncated.lastIndexOf(' ')
    
    return lastSpaceIndex > 0 
      ? truncated.substring(0, lastSpaceIndex) + '...'
      : truncated + '...'
  }

  static calculateReadingTime(content: string): number {
    const wordsPerMinute = 200
    const words = content.split(/\s+/).length
    return Math.ceil(words / wordsPerMinute)
  }

  static generateSEOKeywords(title: string, content: string): string {
    const commonWords = ['de', 'het', 'een', 'en', 'van', 'te', 'dat', 'die', 'in', 'voor', 'op', 'met', 'als', 'zijn', 'er', 'maar', 'om', 'door', 'over', 'zo', 'ook', 'naar', 'uit', 'dan', 'bij', 'nog', 'kunnen', 'hebben', 'was', 'wordt', 'dit', 'aan', 'tegen', 'tot', 'onder', 'want', 'tussen', 'tijdens', 'naar', 'zonder', 'vanaf', 'binnen', 'buiten']
    
    const text = (title + ' ' + content).toLowerCase()
    const words: string[] = text.match(/\b\w+\b/g) || []
    
    const wordCount = words.reduce((acc: Record<string, number>, word: string) => {
      if (word.length > 3 && !commonWords.includes(word)) {
        acc[word] = (acc[word] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word)
      .join(', ')
  }

  static buildSearchQuery(params: BlogSearchParams): any {
    const where: any = {}
    
    if (params.query) {
      where.OR = [
        { title: { contains: params.query, mode: 'insensitive' } },
        { content: { contains: params.query, mode: 'insensitive' } },
        { excerpt: { contains: params.query, mode: 'insensitive' } }
      ]
    }
    
    if (params.category) {
      where.categories = {
        some: { slug: params.category }
      }
    }
    
    if (params.tag) {
      where.tags = {
        some: { slug: params.tag }
      }
    }
    
    if (params.status) {
      where.status = params.status
    } else {
      where.status = 'PUBLISHED'
    }
    
    return where
  }

  static formatDate(date: Date, locale: string = 'nl-NL'): string {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  static generateMetaDescription(post: BlogPost): string {
    if (post.metaDescription) {
      return post.metaDescription
    }
    
    return this.extractExcerpt(post.content, 155)
  }

  static generateCanonicalUrl(slug: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://adviesnconsultancy.nl'
    return `${baseUrl}/kenniscentrum/${slug}`
  }

  static generateStructuredData(post: BlogPost) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: this.generateMetaDescription(post),
      image: post.featuredImage ? [post.featuredImage] : [],
      datePublished: post.publishedAt?.toISOString(),
      dateModified: post.updatedAt.toISOString(),
      author: {
        '@type': 'Person',
        name: post.authorName,
        email: post.authorEmail
      },
      publisher: {
        '@type': 'Organization',
        name: 'Advies N Consultancy BV',
        logo: {
          '@type': 'ImageObject',
          url: 'https://advieskeuzecontent.blob.core.windows.net/images/87e0133c-d18d-4a95-bda0-fade12a0640d.jpg'
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': this.generateCanonicalUrl(post.slug)
      }
    }
  }
}



import { SocialMediaPost, SocialShareData } from './types'

export class SocialMediaService {
  private static instance: SocialMediaService
  
  public static getInstance(): SocialMediaService {
    if (!SocialMediaService.instance) {
      SocialMediaService.instance = new SocialMediaService()
    }
    return SocialMediaService.instance
  }

  generateShareUrls(data: SocialShareData): Record<string, string> {
    const encodedUrl = encodeURIComponent(data.url)
    const encodedTitle = encodeURIComponent(data.title)
    const encodedDescription = encodeURIComponent(data.description)
    
    return {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&via=adviesnconsult`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`
    }
  }

  async fetchLinkedInPosts(): Promise<SocialMediaPost[]> {
    // In a real implementation, this would fetch from LinkedIn API
    // For now, returning mock data
    return [
      {
        id: '1',
        platform: 'LINKEDIN' as const,
        postId: 'li-post-1',
        content: 'Nieuwe blog post over NIS2 compliance en wat dit betekent voor Nederlandse bedrijven. 🛡️ #NIS2 #Compliance #ITSecurity',
        url: 'https://linkedin.com/posts/marcvandermeer-123',
        imageUrl: '/landscape-hero-bg.jpg',
        publishedAt: new Date('2024-01-15'),
        engagements: 24,
        createdAt: new Date('2024-01-15')
      },
      {
        id: '2',
        platform: 'LINKEDIN' as const,
        postId: 'li-post-2',
        content: 'AI transformatie in het MKB: 5 praktische stappen om te beginnen. Lees meer in ons kenniscentrum. 🤖 #AI #Digitalisering',
        url: 'https://linkedin.com/posts/marcvandermeer-124',
        publishedAt: new Date('2024-01-10'),
        engagements: 18,
        createdAt: new Date('2024-01-10')
      }
    ]
  }

  async fetchTwitterPosts(): Promise<SocialMediaPost[]> {
    // In a real implementation, this would fetch from Twitter API
    // For now, returning mock data
    return [
      {
        id: '3',
        platform: 'TWITTER' as const,
        postId: 'tw-post-1',
        content: 'Business continuity in 2024: De rol van cloud-native architecturen. Nieuwe case study online! ☁️ #BusinessContinuity',
        url: 'https://twitter.com/adviesnconsult/status/123',
        publishedAt: new Date('2024-01-12'),
        engagements: 12,
        createdAt: new Date('2024-01-12')
      }
    ]
  }

  async trackSocialShare(postId: string, platform: string): Promise<void> {
    try {
      // Track social share in analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'share', {
          method: platform,
          content_type: 'blog_post',
          item_id: postId
        })
      }
    } catch (error) {
      console.error('Social share tracking error:', error)
    }
  }

  generateSocialMetaTags(data: SocialShareData): string {
    return `
      <!-- Open Graph / Facebook -->
      <meta property="og:type" content="article" />
      <meta property="og:url" content="${data.url}" />
      <meta property="og:title" content="${data.title}" />
      <meta property="og:description" content="${data.description}" />
      ${data.image ? `<meta property="og:image" content="${data.image}" />` : ''}
      
      <!-- Twitter -->
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content="${data.url}" />
      <meta property="twitter:title" content="${data.title}" />
      <meta property="twitter:description" content="${data.description}" />
      ${data.image ? `<meta property="twitter:image" content="${data.image}" />` : ''}
      
      <!-- LinkedIn -->
      <meta property="linkedin:card" content="summary_large_image" />
      <meta property="linkedin:url" content="${data.url}" />
      <meta property="linkedin:title" content="${data.title}" />
      <meta property="linkedin:description" content="${data.description}" />
      ${data.image ? `<meta property="linkedin:image" content="${data.image}" />` : ''}
    `
  }
}

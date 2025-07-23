
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Linkedin, Twitter, ExternalLink, Heart, MessageCircle, Share2 } from 'lucide-react'
import { SocialMediaPost } from '@/lib/types'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface SocialFeedProps {
  platform?: 'LINKEDIN' | 'TWITTER' | 'FACEBOOK'
  limit?: number
  showHeader?: boolean
  className?: string
}

export function SocialFeed({ 
  platform, 
  limit = 5, 
  showHeader = true, 
  className = '' 
}: SocialFeedProps) {
  const [posts, setPosts] = useState<SocialMediaPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [platform, limit])

  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        ...(platform && { platform }),
        limit: limit.toString()
      })
      
      const response = await fetch(`/api/social/posts?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setPosts(result.data)
      } else {
        setError(result.error || 'Failed to fetch posts')
      }
    } catch (error) {
      console.error('Social feed error:', error)
      setError('Failed to load social posts')
    } finally {
      setIsLoading(false)
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'LINKEDIN':
        return <Linkedin className="w-5 h-5 text-[#0077b5]" />
      case 'TWITTER':
        return <Twitter className="w-5 h-5 text-[#1da1f2]" />
      case 'FACEBOOK':
        return <div className="w-5 h-5 bg-[#1877f2] rounded text-white flex items-center justify-center text-xs font-bold">f</div>
      default:
        return <Share2 className="w-5 h-5 text-gray-600" />
    }
  }

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'LINKEDIN':
        return 'LinkedIn'
      case 'TWITTER':
        return 'Twitter'
      case 'FACEBOOK':
        return 'Facebook'
      default:
        return 'Social Media'
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date))
  }

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {showHeader && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Social Media Updates
          </h3>
        )}
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-5 h-5 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${className}`}>
        {showHeader && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Social Media Updates
          </h3>
        )}
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-center">
            <p className="text-red-600">Kon social media posts niet laden</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchPosts}
              className="mt-2"
            >
              Opnieuw proberen
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {showHeader && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {platform ? `${getPlatformName(platform)} Updates` : 'Social Media Updates'}
        </h3>
      )}
      
      <div className="space-y-4">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getPlatformIcon(post.platform)}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        Advies N Consultancy
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {getPlatformName(post.platform)}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(post.publishedAt)}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-3 leading-relaxed">
                  {post.content}
                </p>
                
                {post.imageUrl && (
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
                    <Image
                      src={post.imageUrl}
                      alt="Social media post"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{post.engagements}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>Reacties</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(post.url, '_blank')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Bekijk post
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        
        {posts.length === 0 && (
          <Card className="border-gray-200 bg-gray-50">
            <CardContent className="p-8 text-center">
              <Share2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Nog geen social media posts beschikbaar
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

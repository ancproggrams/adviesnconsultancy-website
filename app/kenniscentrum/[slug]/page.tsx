
'use client'

import { useState, useEffect } from 'react'
import { BlogPost } from '@/lib/types'
import { BlogUtils } from '@/lib/blog-utils'
import { SocialShareButtons } from '@/components/social/social-share-buttons'
import { NewsletterSignup } from '@/components/newsletter/newsletter-signup'
import { SocialFeed } from '@/components/social/social-feed'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar, 
  User, 
  Eye, 
  Clock, 
  ArrowLeft, 
  BookOpen,
  Share2,
  MessageCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface BlogPostPageProps {
  params: { slug: string }
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPost()
  }, [params.slug])

  const fetchPost = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/blog/posts/${params.slug}`)
      const result = await response.json()
      
      if (result.success) {
        setPost(result.data)
        fetchRelatedPosts(result.data)
      } else {
        setError(result.error || 'Post not found')
      }
    } catch (error) {
      console.error('Error fetching post:', error)
      setError('Failed to load post')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRelatedPosts = async (currentPost: BlogPost) => {
    try {
      const categoryParam = currentPost.categories?.[0]?.slug || ''
      const response = await fetch(`/api/blog/posts?category=${categoryParam}&limit=3`)
      const result = await response.json()
      
      if (result.success) {
        // Filter out current post and take first 3
        const related = result.data.filter((p: BlogPost) => p.id !== currentPost.id).slice(0, 3)
        setRelatedPosts(related)
      }
    } catch (error) {
      console.error('Error fetching related posts:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 max-w-4xl py-20">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-64 bg-gray-200 rounded" />
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return notFound()
  }

  const readingTime = BlogUtils.calculateReadingTime(post.content)
  const formattedDate = BlogUtils.formatDate(post.publishedAt || post.createdAt)
  const postUrl = `https://adviesnconsultancy.nl/kenniscentrum/${post.slug}`

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Link href="/kenniscentrum">
              <Button variant="ghost" className="text-white hover:bg-white/20 mb-8">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Terug naar Kenniscentrum
              </Button>
            </Link>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {post.categories?.map((category) => (
                <Badge
                  key={category.id}
                  variant="secondary"
                  style={{ backgroundColor: category.color + '20', color: 'white' }}
                  className="text-sm"
                >
                  {category.name}
                </Badge>
              ))}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
              {post.excerpt}
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-blue-100">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>{post.authorName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{readingTime} min leestijd</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <span>{post.viewCount} views</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Article Content */}
            <div className="lg:col-span-3">
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg border-0 overflow-hidden"
              >
                {post.featuredImage && (
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                
                <div className="p-8">
                  {/* Article Body */}
                  <div 
                    className="prose prose-lg max-w-none mb-12"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                  
                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold mb-4">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            className="text-blue-600 hover:bg-blue-50 cursor-pointer"
                          >
                            #{tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Separator className="my-8" />
                  
                  {/* Social Share */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                      <h4 className="text-lg font-semibold mb-2">Deel dit artikel</h4>
                      <p className="text-gray-600 text-sm">
                        Help anderen door deze kennis te delen
                      </p>
                    </div>
                    <SocialShareButtons
                      url={postUrl}
                      title={post.title}
                      description={post.excerpt}
                      image={post.featuredImage}
                      postId={post.id}
                      size="lg"
                      variant="colorful"
                    />
                  </div>
                  
                  {/* Author */}
                  <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {post.authorName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-blue-900">
                            {post.authorName}
                          </h4>
                          <p className="text-blue-700 text-sm">
                            IT Consultant & Business Continuity Expert
                          </p>
                          <p className="text-blue-600 text-sm mt-1">
                            {post.authorEmail}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.article>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-8">
              {/* Newsletter */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <NewsletterSignup
                  source="blog-post"
                  variant="compact"
                  showPreferences={false}
                />
              </motion.div>
              
              {/* Social Feed */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
                  <CardContent className="p-6">
                    <SocialFeed limit={3} showHeader={true} />
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
          
          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-16"
            >
              <h3 className="text-3xl font-bold text-gray-900 mb-8">
                Gerelateerde Artikelen
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost, index) => (
                  <Card key={relatedPost.id} className="group hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        {relatedPost.categories?.map((category) => (
                          <Badge
                            key={category.id}
                            variant="secondary"
                            style={{ backgroundColor: category.color + '20', color: category.color }}
                            className="text-xs"
                          >
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                      <h4 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600">
                        <Link href={`/kenniscentrum/${relatedPost.slug}`}>
                          {relatedPost.title}
                        </Link>
                      </h4>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {relatedPost.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{BlogUtils.formatDate(relatedPost.publishedAt || relatedPost.createdAt)}</span>
                        <span>{BlogUtils.calculateReadingTime(relatedPost.content)} min</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}

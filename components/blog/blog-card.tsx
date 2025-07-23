
'use client'

import { BlogPost } from '@/lib/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, User, Eye, Share2 } from 'lucide-react'
import { BlogUtils } from '@/lib/blog-utils'
import { SocialShareButtons } from '@/components/social/social-share-buttons'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface BlogCardProps {
  post: BlogPost
  index?: number
  showSocial?: boolean
}

export function BlogCard({ post, index = 0, showSocial = false }: BlogCardProps) {
  const readingTime = BlogUtils.calculateReadingTime(post.content)
  const formattedDate = BlogUtils.formatDate(post.publishedAt || post.createdAt)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Card className="h-full overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        {post.featuredImage && (
          <div className="relative aspect-[16/9] overflow-hidden">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}
        
        <CardHeader className="pb-3">
          <div className="flex flex-wrap gap-2 mb-3">
            {post.categories?.map((category) => (
              <Badge
                key={category.id}
                variant="secondary"
                style={{ backgroundColor: category.color + '20', color: category.color }}
                className="text-xs font-medium"
              >
                {category.name}
              </Badge>
            ))}
          </div>
          
          <h3 className="font-bold text-xl leading-tight text-gray-900 group-hover:text-blue-600 transition-colors">
            <Link href={`/kenniscentrum/${post.slug}`} className="hover:underline">
              {post.title}
            </Link>
          </h3>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-gray-600 line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{post.authorName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{post.viewCount} views</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{readingTime} min leestijd</span>
            {post.tags && post.tags.length > 0 && (
              <>
                <span>•</span>
                <div className="flex flex-wrap gap-1">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span key={tag.id} className="text-blue-600 hover:underline">
                      #{tag.name}
                    </span>
                  ))}
                  {post.tags.length > 3 && (
                    <span className="text-gray-400">+{post.tags.length - 3} meer</span>
                  )}
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t">
            <Link href={`/kenniscentrum/${post.slug}`}>
              <Button variant="outline" className="group/btn">
                Lees meer
                <Share2 className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
              </Button>
            </Link>
            
            {showSocial && (
              <SocialShareButtons
                url={`https://adviesnconsultancy.nl/kenniscentrum/${post.slug}`}
                title={post.title}
                description={post.excerpt}
                image={post.featuredImage}
                size="sm"
              />
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

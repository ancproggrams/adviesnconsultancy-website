
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { BlogUtils } from '@/lib/blog-utils'
import { BlogSearchParams } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || undefined
    const category = searchParams.get('category') || undefined
    const tag = searchParams.get('tag') || undefined
    const status = searchParams.get('status') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const params: BlogSearchParams = {
      query,
      category,
      tag,
      status,
      page,
      limit
    }

    const where = BlogUtils.buildSearchQuery(params)
    const skip = (page - 1) * limit

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: {
          categories: true,
          tags: true
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.blogPost.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Blog posts fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Generate slug from title
    const slug = BlogUtils.generateSlug(data.title)
    
    // Generate excerpt if not provided
    const excerpt = data.excerpt || BlogUtils.extractExcerpt(data.content)
    
    // Generate keywords if not provided
    const keywords = data.keywords || BlogUtils.generateSEOKeywords(data.title, data.content)
    
    // Create blog post
    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug,
        excerpt,
        content: data.content,
        featuredImage: data.featuredImage,
        status: data.status || 'DRAFT',
        metaTitle: data.metaTitle || data.title,
        metaDescription: data.metaDescription || excerpt,
        keywords,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
        categories: {
          connect: data.categories?.map((id: string) => ({ id })) || []
        },
        tags: {
          connect: data.tags?.map((id: string) => ({ id })) || []
        }
      },
      include: {
        categories: true,
        tags: true
      }
    })

    return NextResponse.json({
      success: true,
      data: post,
      message: 'Blog post created successfully'
    })
  } catch (error) {
    console.error('Blog post creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}

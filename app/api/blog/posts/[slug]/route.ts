
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { BlogUtils } from '@/lib/blog-utils'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: params.slug },
      include: {
        categories: true,
        tags: true
      }
    })

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } }
    })

    return NextResponse.json({
      success: true,
      data: post
    })
  } catch (error) {
    console.error('Blog post fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog post' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const data = await request.json()
    
    // Generate new slug if title changed
    const newSlug = data.title ? BlogUtils.generateSlug(data.title) : params.slug
    
    const post = await prisma.blogPost.update({
      where: { slug: params.slug },
      data: {
        title: data.title,
        slug: newSlug,
        excerpt: data.excerpt || BlogUtils.extractExcerpt(data.content),
        content: data.content,
        featuredImage: data.featuredImage,
        status: data.status,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        keywords: data.keywords,
        publishedAt: data.status === 'PUBLISHED' && !data.publishedAt ? new Date() : data.publishedAt,
        categories: {
          set: data.categories?.map((id: string) => ({ id })) || []
        },
        tags: {
          set: data.tags?.map((id: string) => ({ id })) || []
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
      message: 'Blog post updated successfully'
    })
  } catch (error) {
    console.error('Blog post update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update blog post' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await prisma.blogPost.delete({
      where: { slug: params.slug }
    })

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully'
    })
  } catch (error) {
    console.error('Blog post deletion error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete blog post' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { SocialMediaService } from '@/lib/social-media'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform') || undefined
    const limit = parseInt(searchParams.get('limit') || '10')

    const where = platform ? { platform: platform as any } : {}

    const posts = await prisma.socialMediaPost.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: limit
    })

    return NextResponse.json({
      success: true,
      data: posts
    })
  } catch (error) {
    console.error('Social media posts fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch social media posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const post = await prisma.socialMediaPost.create({
      data: {
        platform: data.platform,
        postId: data.postId,
        content: data.content,
        url: data.url,
        imageUrl: data.imageUrl,
        publishedAt: new Date(data.publishedAt),
        engagements: data.engagements || 0
      }
    })

    return NextResponse.json({
      success: true,
      data: post,
      message: 'Social media post created successfully'
    })
  } catch (error) {
    console.error('Social media post creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create social media post' },
      { status: 500 }
    )
  }
}

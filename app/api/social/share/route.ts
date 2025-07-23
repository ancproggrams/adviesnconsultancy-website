
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { SocialMediaService } from '@/lib/social-media'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { postId, platform } = await request.json()
    
    // Increment share count for blog post
    await prisma.blogPost.update({
      where: { id: postId },
      data: { shareCount: { increment: 1 } }
    })

    // Track in analytics
    const socialService = SocialMediaService.getInstance()
    await socialService.trackSocialShare(postId, platform)

    return NextResponse.json({
      success: true,
      message: 'Social share tracked successfully'
    })
  } catch (error) {
    console.error('Social share tracking error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to track social share' },
      { status: 500 }
    )
  }
}

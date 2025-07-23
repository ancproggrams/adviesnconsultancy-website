
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { BlogUtils } from '@/lib/blog-utils'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const tags = await prisma.blogTag.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: tags
    })
  } catch (error) {
    console.error('Tags fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const slug = BlogUtils.generateSlug(data.name)
    
    const tag = await prisma.blogTag.create({
      data: {
        name: data.name,
        slug
      }
    })

    return NextResponse.json({
      success: true,
      data: tag,
      message: 'Tag created successfully'
    })
  } catch (error) {
    console.error('Tag creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create tag' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { BlogUtils } from '@/lib/blog-utils'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const categories = await prisma.blogCategory.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: categories
    })
  } catch (error) {
    console.error('Categories fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const slug = BlogUtils.generateSlug(data.name)
    
    const category = await prisma.blogCategory.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        color: data.color || '#60B5FF'
      }
    })

    return NextResponse.json({
      success: true,
      data: category,
      message: 'Category created successfully'
    })
  } catch (error) {
    console.error('Category creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    )
  }
}

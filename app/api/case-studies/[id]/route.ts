
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const caseStudy = await db.caseStudy.findUnique({
      where: { id: params.id }
    })

    if (!caseStudy) {
      return NextResponse.json(
        { error: 'Case study not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ caseStudy })
  } catch (error) {
    console.error('Error fetching case study:', error)
    return NextResponse.json(
      { error: 'Failed to fetch case study' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      title, 
      industry, 
      challenge, 
      solution, 
      result, 
      duration, 
      imageUrl, 
      status 
    } = body

    // Generate new slug if title changed
    let updateData: any = {
      title,
      industry,
      challenge,
      solution,
      result,
      duration,
      imageUrl,
      status
    }

    if (title) {
      updateData.slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }

    // Set publishedAt if status changes to PUBLISHED
    if (status === 'PUBLISHED') {
      const existing = await db.caseStudy.findUnique({
        where: { id: params.id },
        select: { publishedAt: true }
      })
      
      if (!existing?.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }

    const caseStudy = await db.caseStudy.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({ caseStudy })
  } catch (error) {
    console.error('Error updating case study:', error)
    return NextResponse.json(
      { error: 'Failed to update case study' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    let updateData: any = { status }

    // Set publishedAt if status changes to PUBLISHED
    if (status === 'PUBLISHED') {
      const existing = await db.caseStudy.findUnique({
        where: { id: params.id },
        select: { publishedAt: true }
      })
      
      if (!existing?.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }

    const caseStudy = await db.caseStudy.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({ caseStudy })
  } catch (error) {
    console.error('Error updating case study status:', error)
    return NextResponse.json(
      { error: 'Failed to update case study status' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await db.caseStudy.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting case study:', error)
    return NextResponse.json(
      { error: 'Failed to delete case study' },
      { status: 500 }
    )
  }
}

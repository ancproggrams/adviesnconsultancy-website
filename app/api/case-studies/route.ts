
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const caseStudies = await db.caseStudy.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ caseStudies })
  } catch (error) {
    console.error('Error fetching case studies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch case studies' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
      status = 'DRAFT' 
    } = body

    if (!title || !industry || !challenge || !solution || !result || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const caseStudy = await db.caseStudy.create({
      data: {
        title,
        slug,
        industry,
        challenge,
        solution,
        result,
        duration,
        imageUrl,
        status,
        publishedAt: status === 'PUBLISHED' ? new Date() : null
      }
    })

    return NextResponse.json({ caseStudy }, { status: 201 })
  } catch (error) {
    console.error('Error creating case study:', error)
    return NextResponse.json(
      { error: 'Failed to create case study' },
      { status: 500 }
    )
  }
}

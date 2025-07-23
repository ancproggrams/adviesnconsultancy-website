
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const downloads = await db.downloadResource.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ downloads })
  } catch (error) {
    console.error('Error fetching downloads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch downloads' },
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
      description, 
      category, 
      type, 
      fileUrl, 
      fileName, 
      fileSize, 
      isActive = true 
    } = body

    if (!title || !description || !category || !type || !fileUrl || !fileName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const download = await db.downloadResource.create({
      data: {
        title,
        description,
        category,
        type,
        fileUrl,
        fileName,
        fileSize,
        isActive
      }
    })

    return NextResponse.json({ download }, { status: 201 })
  } catch (error) {
    console.error('Error creating download:', error)
    return NextResponse.json(
      { error: 'Failed to create download' },
      { status: 500 }
    )
  }
}

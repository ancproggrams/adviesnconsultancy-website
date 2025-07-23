
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
    const download = await db.downloadResource.findUnique({
      where: { id: params.id }
    })

    if (!download) {
      return NextResponse.json(
        { error: 'Download not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ download })
  } catch (error) {
    console.error('Error fetching download:', error)
    return NextResponse.json(
      { error: 'Failed to fetch download' },
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
      description, 
      category, 
      type, 
      fileUrl, 
      fileName, 
      fileSize, 
      isActive 
    } = body

    const download = await db.downloadResource.update({
      where: { id: params.id },
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

    return NextResponse.json({ download })
  } catch (error) {
    console.error('Error updating download:', error)
    return NextResponse.json(
      { error: 'Failed to update download' },
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
    const { isActive } = body

    const download = await db.downloadResource.update({
      where: { id: params.id },
      data: { isActive }
    })

    return NextResponse.json({ download })
  } catch (error) {
    console.error('Error updating download status:', error)
    return NextResponse.json(
      { error: 'Failed to update download status' },
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

    await db.downloadResource.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting download:', error)
    return NextResponse.json(
      { error: 'Failed to delete download' },
      { status: 500 }
    )
  }
}

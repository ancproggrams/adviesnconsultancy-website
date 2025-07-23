
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { IncidentResponse } from '@/lib/security-week3-4'
import { createSecureApiResponse, createErrorResponse } from '@/lib/security-enhanced'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    if (!token || !token.isActive || !['SUPER_ADMIN', 'ADMIN'].includes(token.role as string)) {
      return createErrorResponse('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const limit = parseInt(searchParams.get('limit') || '50')

    const incidents = await prisma.incidentResponse.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(priority && { priority: priority as any })
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return createSecureApiResponse({
      success: true,
      incidents
    })

  } catch (error) {
    console.error('Incident response error:', error)
    return createErrorResponse('Failed to load incidents', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    if (!token || !token.isActive || !['SUPER_ADMIN', 'ADMIN'].includes(token.role as string)) {
      return createErrorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const { triggerEventId, responseType, priority, title, description, actionsPlan } = body

    const incident = await IncidentResponse.createIncident(
      triggerEventId,
      responseType,
      priority,
      title,
      description,
      actionsPlan
    )

    return createSecureApiResponse({
      success: true,
      incident
    })

  } catch (error) {
    console.error('Create incident error:', error)
    return createErrorResponse('Failed to create incident', 500)
  }
}

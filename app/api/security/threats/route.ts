
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { AdvancedThreatDetection } from '@/lib/security-week3-4'
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
    const severity = searchParams.get('severity')
    const limit = parseInt(searchParams.get('limit') || '50')

    const threats = await prisma.threatDetection.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(severity && { severity: severity as any })
      },
      orderBy: { firstDetected: 'desc' },
      take: limit
    })

    return createSecureApiResponse({
      success: true,
      threats
    })

  } catch (error) {
    console.error('Threat detection error:', error)
    return createErrorResponse('Failed to load threats', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    if (!token || !token.isActive || !['SUPER_ADMIN', 'ADMIN'].includes(token.role as string)) {
      return createErrorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const { type, severity, source, description, indicators } = body

    const threat = await AdvancedThreatDetection.createThreatDetection(
      type,
      severity,
      source,
      description,
      indicators
    )

    return createSecureApiResponse({
      success: true,
      threat
    })

  } catch (error) {
    console.error('Create threat detection error:', error)
    return createErrorResponse('Failed to create threat detection', 500)
  }
}

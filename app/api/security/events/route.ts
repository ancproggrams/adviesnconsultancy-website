
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { SecurityLogger } from '@/lib/security-week2'
import { createSecureApiResponse, createErrorResponse } from '@/lib/security-enhanced'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

// Get security events with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return createErrorResponse('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const severity = searchParams.get('severity')
    const type = searchParams.get('type')
    const source = searchParams.get('source')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause
    const where: any = {}
    
    if (severity) {
      where.severity = severity
    }
    
    if (type) {
      where.type = type
    }
    
    if (source) {
      where.source = source
    }
    
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    // Get events with pagination
    const [events, totalCount] = await Promise.all([
      prisma.securityEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.securityEvent.count({ where })
    ])

    // Get summary statistics
    const [
      severityStats,
      typeStats,
      sourceStats
    ] = await Promise.all([
      prisma.securityEvent.groupBy({
        by: ['severity'],
        where,
        _count: true
      }),
      prisma.securityEvent.groupBy({
        by: ['type'],
        where,
        _count: true
      }),
      prisma.securityEvent.groupBy({
        by: ['source'],
        where,
        _count: true
      })
    ])

    return createSecureApiResponse({
      events,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      statistics: {
        bySeverity: severityStats,
        byType: typeStats,
        bySource: sourceStats
      }
    })
  } catch (error) {
    console.error('Security events GET error:', error)
    return createErrorResponse('Failed to load security events', 500)
  }
}

// Mark security event as resolved
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return createErrorResponse('Unauthorized', 401)
    }

    const adminId = session.user.id
    const body = await request.json()
    const { eventId, resolved } = body

    if (!eventId || typeof resolved !== 'boolean') {
      return createErrorResponse('Invalid request data', 400)
    }

    // Update event resolution status
    const updatedEvent = await prisma.securityEvent.update({
      where: { id: eventId },
      data: {
        resolved,
        resolvedBy: resolved ? adminId : null,
        resolvedAt: resolved ? new Date() : null
      }
    })

    await SecurityLogger.logEvent('SECURITY_EVENT_RESOLVED', 'LOW', {
      eventId,
      resolvedBy: adminId,
      eventType: updatedEvent.type
    })

    return createSecureApiResponse({
      message: `Security event ${resolved ? 'resolved' : 'reopened'}`,
      event: updatedEvent
    })
  } catch (error) {
    console.error('Security event update error:', error)
    return createErrorResponse('Failed to update security event', 500)
  }
}

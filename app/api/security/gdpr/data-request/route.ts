
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { GdprManager, SecurityLogger, dataProcessingRequestSchema } from '@/lib/security-week2'
import { createSecureApiResponse, createErrorResponse } from '@/lib/security-enhanced'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

// Create data processing request (public endpoint)
export async function POST(request: NextRequest) {
  try {
    const ip = request.ip || request.headers.get('X-Forwarded-For') || 'unknown'
    const userAgent = request.headers.get('User-Agent') || 'unknown'
    
    const body = await request.json()
    const validation = dataProcessingRequestSchema.safeParse(body)

    if (!validation.success) {
      return createErrorResponse('Invalid request: ' + validation.error.message, 400)
    }

    const { email, requestType, description } = validation.data

    // Create GDPR request
    const dataRequest = await GdprManager.createDataProcessingRequest(
      email,
      requestType,
      { description, ipAddress: ip, userAgent }
    )

    await SecurityLogger.logEvent('GDPR_REQUEST_CREATED', 'MEDIUM', {
      email,
      requestType,
      requestId: dataRequest.id,
      ipAddress: ip,
      userAgent
    })

    return createSecureApiResponse({
      message: 'Data processing request submitted successfully',
      requestId: dataRequest.id,
      status: dataRequest.status,
      estimatedProcessingTime: '30 days maximum'
    }, 201)
  } catch (error) {
    console.error('GDPR request creation error:', error)
    return createErrorResponse('Failed to submit data processing request', 500)
  }
}

// Get all data processing requests (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Check admin permissions
    const admin = await prisma.admin.findUnique({
      where: { id: session.user.id }
    })

    if (!admin || !['SUPER_ADMIN', 'ADMIN'].includes(admin.role)) {
      return createErrorResponse('Insufficient permissions', 403)
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const requestType = searchParams.get('requestType')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

    // Build where clause
    const where: any = {}
    if (status) where.status = status
    if (requestType) where.requestType = requestType

    const [requests, totalCount] = await Promise.all([
      prisma.dataProcessingRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.dataProcessingRequest.count({ where })
    ])

    return createSecureApiResponse({
      requests,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    console.error('GDPR requests GET error:', error)
    return createErrorResponse('Failed to load data processing requests', 500)
  }
}

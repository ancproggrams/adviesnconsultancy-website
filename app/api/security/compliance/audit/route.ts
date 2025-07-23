
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { ComplianceManager } from '@/lib/security-week3-4'
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
    const complianceType = searchParams.get('complianceType')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '100')

    const auditLogs = await prisma.complianceAuditLog.findMany({
      where: {
        ...(complianceType && { complianceType }),
        ...(startDate && endDate && {
          timestamp: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        })
      },
      orderBy: { timestamp: 'desc' },
      take: limit
    })

    return createSecureApiResponse({
      success: true,
      auditLogs
    })

  } catch (error) {
    console.error('Compliance audit error:', error)
    return createErrorResponse('Failed to load audit logs', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    if (!token || !token.isActive) {
      return createErrorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const { 
      complianceType, 
      action, 
      resource, 
      resourceId, 
      oldValues, 
      newValues, 
      businessJustification 
    } = body

    const ipAddress = request.ip || request.headers.get('X-Forwarded-For') || 'unknown'
    const userAgent = request.headers.get('User-Agent') || 'unknown'

    const auditLog = await ComplianceManager.logComplianceAction(
      complianceType,
      action,
      resource,
      resourceId,
      token.sub as string,
      ipAddress,
      userAgent,
      oldValues,
      newValues,
      businessJustification
    )

    return createSecureApiResponse({
      success: true,
      auditLog
    })

  } catch (error) {
    console.error('Create compliance audit log error:', error)
    return createErrorResponse('Failed to create audit log', 500)
  }
}

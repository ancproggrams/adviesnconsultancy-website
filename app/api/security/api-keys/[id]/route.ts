
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { SecurityLogger } from '@/lib/security-week2'
import { createSecureApiResponse, createErrorResponse } from '@/lib/security-enhanced'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

interface RouteParams {
  params: {
    id: string
  }
}

// Update API key status
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return createErrorResponse('Unauthorized', 401)
    }

    const adminId = session.user.id
    const { id } = params

    // Check permissions
    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    })

    if (!admin || !['SUPER_ADMIN', 'ADMIN'].includes(admin.role)) {
      return createErrorResponse('Insufficient permissions', 403)
    }

    const body = await request.json()
    const { isActive, rateLimit } = body

    // Verify API key ownership
    const apiKey = await prisma.apiKey.findFirst({
      where: { 
        id,
        adminId // Ensure user can only modify their own keys
      }
    })

    if (!apiKey) {
      return createErrorResponse('API key not found', 404)
    }

    // Update API key
    const updatedKey = await prisma.apiKey.update({
      where: { id },
      data: {
        isActive: isActive !== undefined ? isActive : apiKey.isActive,
        rateLimit: rateLimit !== undefined ? rateLimit : apiKey.rateLimit,
        updatedAt: new Date()
      }
    })

    await SecurityLogger.logEvent('API_KEY_UPDATED', 'MEDIUM', {
      adminId,
      keyId: id,
      changes: { isActive, rateLimit }
    })

    return createSecureApiResponse({
      message: 'API key updated successfully',
      apiKey: {
        id: updatedKey.id,
        name: updatedKey.name,
        isActive: updatedKey.isActive,
        rateLimit: updatedKey.rateLimit,
        updatedAt: updatedKey.updatedAt
      }
    })
  } catch (error) {
    console.error('API Key update error:', error)
    return createErrorResponse('Failed to update API key', 500)
  }
}

// Delete API key
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return createErrorResponse('Unauthorized', 401)
    }

    const adminId = session.user.id
    const { id } = params

    // Check permissions
    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    })

    if (!admin || !['SUPER_ADMIN', 'ADMIN'].includes(admin.role)) {
      return createErrorResponse('Insufficient permissions', 403)
    }

    // Verify API key ownership
    const apiKey = await prisma.apiKey.findFirst({
      where: { 
        id,
        adminId
      }
    })

    if (!apiKey) {
      return createErrorResponse('API key not found', 404)
    }

    // Delete API key and all related usage data
    await prisma.apiUsage.deleteMany({
      where: { apiKeyId: id }
    })

    await prisma.apiKey.delete({
      where: { id }
    })

    await SecurityLogger.logEvent('API_KEY_DELETED', 'MEDIUM', {
      adminId,
      keyId: id,
      keyName: apiKey.name
    })

    return createSecureApiResponse({
      message: 'API key deleted successfully'
    })
  } catch (error) {
    console.error('API Key deletion error:', error)
    return createErrorResponse('Failed to delete API key', 500)
  }
}

// Get API key usage statistics
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return createErrorResponse('Unauthorized', 401)
    }

    const adminId = session.user.id
    const { id } = params

    // Verify API key ownership
    const apiKey = await prisma.apiKey.findFirst({
      where: { 
        id,
        adminId
      }
    })

    if (!apiKey) {
      return createErrorResponse('API key not found', 404)
    }

    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // Get usage statistics
    const [
      totalUsage,
      last24HourUsage,
      last7DayUsage,
      usageByEndpoint,
      usageOverTime
    ] = await Promise.all([
      prisma.apiUsage.count({
        where: { apiKeyId: id }
      }),
      prisma.apiUsage.count({
        where: {
          apiKeyId: id,
          timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      }),
      prisma.apiUsage.count({
        where: {
          apiKeyId: id,
          timestamp: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      }),
      prisma.apiUsage.groupBy({
        by: ['endpoint'],
        where: {
          apiKeyId: id,
          timestamp: { gte: last30Days }
        },
        _count: true,
        _avg: { duration: true }
      }),
      prisma.apiUsage.groupBy({
        by: ['timestamp'],
        where: {
          apiKeyId: id,
          timestamp: { gte: last30Days }
        },
        _count: true
      })
    ])

    return createSecureApiResponse({
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        isActive: apiKey.isActive,
        rateLimit: apiKey.rateLimit,
        lastUsed: apiKey.lastUsed
      },
      usage: {
        total: totalUsage,
        last24Hours: last24HourUsage,
        last7Days: last7DayUsage,
        byEndpoint: usageByEndpoint,
        overtime: usageOverTime
      }
    })
  } catch (error) {
    console.error('API Key stats error:', error)
    return createErrorResponse('Failed to get API key statistics', 500)
  }
}

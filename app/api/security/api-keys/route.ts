
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { ApiKeyManager, SecurityLogger, apiKeySchema } from '@/lib/security-week2'
import { createSecureApiResponse, createErrorResponse } from '@/lib/security-enhanced'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

// Get all API keys for authenticated admin
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return createErrorResponse('Unauthorized', 401)
    }

    const adminId = session.user.id

    // Check if user has permission to manage API keys
    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    })

    if (!admin || !['SUPER_ADMIN', 'ADMIN'].includes(admin.role)) {
      await SecurityLogger.logEvent('UNAUTHORIZED_ACCESS', 'MEDIUM', {
        adminId,
        action: 'api_key_list_attempt',
        role: admin?.role
      })
      return createErrorResponse('Insufficient permissions', 403)
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { adminId },
      select: {
        id: true,
        name: true,
        permissions: true,
        rateLimit: true,
        isActive: true,
        lastUsed: true,
        usageCount: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get usage statistics for each API key
    const apiKeysWithStats = await Promise.all(
      apiKeys.map(async (key: any) => {
        const last24HourUsage = await prisma.apiUsage.count({
          where: {
            apiKeyId: key.id,
            timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
          }
        })

        return {
          ...key,
          usage24h: last24HourUsage
        }
      })
    )

    await SecurityLogger.logEvent('API_KEY_LIST_ACCESSED', 'LOW', {
      adminId,
      keyCount: apiKeys.length
    })

    return createSecureApiResponse({
      apiKeys: apiKeysWithStats,
      total: apiKeys.length
    })
  } catch (error) {
    console.error('API Keys GET error:', error)
    return createErrorResponse('Internal server error', 500)
  }
}

// Create new API key
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return createErrorResponse('Unauthorized', 401)
    }

    const adminId = session.user.id

    // Check permissions
    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    })

    if (!admin || !['SUPER_ADMIN', 'ADMIN'].includes(admin.role)) {
      await SecurityLogger.logEvent('UNAUTHORIZED_ACCESS', 'MEDIUM', {
        adminId,
        action: 'api_key_create_attempt',
        role: admin?.role
      })
      return createErrorResponse('Insufficient permissions', 403)
    }

    const body = await request.json()
    const validation = apiKeySchema.safeParse(body)

    if (!validation.success) {
      return createErrorResponse('Invalid data: ' + validation.error.message, 400)
    }

    const { name, permissions, rateLimit, expiresInDays } = validation.data

    // Create API key
    const { apiKey, plainKey } = await ApiKeyManager.createApiKey(
      adminId,
      name,
      permissions,
      rateLimit,
      expiresInDays
    )

    await SecurityLogger.logEvent('API_KEY_CREATED', 'MEDIUM', {
      adminId,
      keyId: apiKey.id,
      keyName: name,
      permissions,
      rateLimit
    })

    // Return the plain key only once (it won't be shown again)
    return createSecureApiResponse({
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        key: plainKey, // Only shown once!
        permissions: apiKey.permissions,
        rateLimit: apiKey.rateLimit,
        expiresAt: apiKey.expiresAt,
        createdAt: apiKey.createdAt
      }
    }, 201)
  } catch (error) {
    console.error('API Key creation error:', error)
    return createErrorResponse('Failed to create API key', 500)
  }
}

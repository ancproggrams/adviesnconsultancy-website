
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { createSecureApiResponse, createErrorResponse } from '@/lib/security-enhanced'
import { prisma } from '@/lib/db'
import { SecurityLogger } from '@/lib/security-week2'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    if (!token || !token.isActive) {
      return createErrorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const { userId, userType } = body

    // Verify the user can manage this account
    if (token.sub !== userId && token.role !== 'SUPER_ADMIN') {
      return createErrorResponse('Forbidden', 403)
    }

    // Remove all 2FA methods for the user
    await prisma.twoFactorAuth.deleteMany({
      where: { userId, userType }
    })

    // Update user security preferences
    await prisma.userSecurityPreference.upsert({
      where: { userId_userType: { userId, userType } },
      create: {
        userId,
        userType,
        twoFactorEnabled: false
      },
      update: {
        twoFactorEnabled: false
      }
    })

    // Log security event
    await SecurityLogger.logEvent('TWO_FACTOR_DISABLED', 'MEDIUM', {
      userId,
      userType,
      disabledBy: token.sub
    }, 'api')

    return createSecureApiResponse({
      success: true,
      message: '2FA disabled successfully'
    })

  } catch (error) {
    console.error('2FA disable error:', error)
    return createErrorResponse('Failed to disable 2FA', 500)
  }
}

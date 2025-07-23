
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { TwoFactorAuthentication } from '@/lib/security-week3-4'
import { createSecureApiResponse, createErrorResponse } from '@/lib/security-enhanced'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    if (!token || !token.isActive) {
      return createErrorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const { userId, userType, token: totpToken } = body

    // Verify the user can manage this account
    if (token.sub !== userId && token.role !== 'SUPER_ADMIN') {
      return createErrorResponse('Forbidden', 403)
    }

    const result = await TwoFactorAuthentication.verifyTOTP(userId, userType, totpToken)

    if (!result.verified) {
      return createErrorResponse(result.error || 'Verification failed', 400)
    }

    // Get backup codes after successful verification
    const tfa = await prisma.twoFactorAuth.findFirst({
      where: { userId, userType, method: 'totp' }
    })

    return createSecureApiResponse({
      success: true,
      verified: true,
      backupCodes: tfa?.backupCodes || []
    })

  } catch (error) {
    console.error('2FA verification error:', error)
    return createErrorResponse('Verification failed', 500)
  }
}

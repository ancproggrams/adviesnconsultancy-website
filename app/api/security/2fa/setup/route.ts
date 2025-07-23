
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { TwoFactorAuthentication } from '@/lib/security-week3-4'
import { createSecureApiResponse, createErrorResponse } from '@/lib/security-enhanced'

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

    const setupData = await TwoFactorAuthentication.setupTOTP(userId, userType)

    return createSecureApiResponse({
      success: true,
      secret: setupData.secret,
      qrCode: setupData.qrCode
    })

  } catch (error) {
    console.error('2FA setup error:', error)
    return createErrorResponse('Failed to setup 2FA', 500)
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { SecurityNotifications } from '@/lib/security-week3-4'
import { createSecureApiResponse, createErrorResponse } from '@/lib/security-enhanced'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    if (!token || !token.isActive) {
      return createErrorResponse('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const userType = searchParams.get('userType')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    if (!userId || !userType) {
      return createErrorResponse('Missing userId or userType', 400)
    }

    // Verify the user can access these notifications
    if (token.sub !== userId && token.role !== 'SUPER_ADMIN') {
      return createErrorResponse('Forbidden', 403)
    }

    const notifications = await SecurityNotifications.getNotifications(
      userId,
      userType as 'admin' | 'customer',
      unreadOnly
    )

    return createSecureApiResponse({
      success: true,
      notifications
    })

  } catch (error) {
    console.error('Security notifications error:', error)
    return createErrorResponse('Failed to load notifications', 500)
  }
}

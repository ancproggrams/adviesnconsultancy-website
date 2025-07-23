
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
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
    const { userId, userType } = body

    // Verify the user can manage these notifications
    if (token.sub !== userId && token.role !== 'SUPER_ADMIN') {
      return createErrorResponse('Forbidden', 403)
    }

    await prisma.securityNotification.updateMany({
      where: {
        userId,
        userType,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    return createSecureApiResponse({
      success: true,
      message: 'All notifications marked as read'
    })

  } catch (error) {
    console.error('Mark all notifications read error:', error)
    return createErrorResponse('Failed to update notifications', 500)
  }
}

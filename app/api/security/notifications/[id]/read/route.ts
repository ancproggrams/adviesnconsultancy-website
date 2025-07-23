
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { SecurityNotifications } from '@/lib/security-week3-4'
import { createSecureApiResponse, createErrorResponse } from '@/lib/security-enhanced'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    if (!token || !token.isActive) {
      return createErrorResponse('Unauthorized', 401)
    }

    const notificationId = params.id

    await SecurityNotifications.markNotificationRead(notificationId)

    return createSecureApiResponse({
      success: true,
      message: 'Notification marked as read'
    })

  } catch (error) {
    console.error('Mark notification read error:', error)
    return createErrorResponse('Failed to update notification', 500)
  }
}

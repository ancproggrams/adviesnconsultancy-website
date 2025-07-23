
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { createSecureApiResponse, createErrorResponse } from '@/lib/security-enhanced'
import { prisma } from '@/lib/db'

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

    if (!userId || !userType) {
      return createErrorResponse('Missing userId or userType', 400)
    }

    // Verify the user can access these preferences
    if (token.sub !== userId && token.role !== 'SUPER_ADMIN') {
      return createErrorResponse('Forbidden', 403)
    }

    const preferences = await prisma.userSecurityPreference.findUnique({
      where: { userId_userType: { userId, userType } }
    })

    return createSecureApiResponse({
      success: true,
      preferences: preferences || {
        twoFactorEnabled: false,
        securityNotifications: true,
        loginNotifications: true,
        unusualActivityAlerts: true,
        passwordChangeReminders: true,
        securityDigestFreq: 'WEEKLY',
        sessionTimeout: 120
      }
    })

  } catch (error) {
    console.error('Security preferences error:', error)
    return createErrorResponse('Failed to load preferences', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    if (!token || !token.isActive) {
      return createErrorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const { userId, userType, preferences } = body

    // Verify the user can manage these preferences
    if (token.sub !== userId && token.role !== 'SUPER_ADMIN') {
      return createErrorResponse('Forbidden', 403)
    }

    const updatedPreferences = await prisma.userSecurityPreference.upsert({
      where: { userId_userType: { userId, userType } },
      create: {
        userId,
        userType,
        ...preferences
      },
      update: preferences
    })

    return createSecureApiResponse({
      success: true,
      preferences: updatedPreferences
    })

  } catch (error) {
    console.error('Update security preferences error:', error)
    return createErrorResponse('Failed to update preferences', 500)
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { SecurityMonitoring } from '@/lib/security-week3-4'
import { createSecureApiResponse, createErrorResponse } from '@/lib/security-enhanced'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    if (!token || !token.isActive) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Get comprehensive security dashboard data
    const dashboardData = await SecurityMonitoring.getSecurityDashboard()

    return createSecureApiResponse({
      success: true,
      ...dashboardData
    })

  } catch (error) {
    console.error('Security dashboard error:', error)
    return createErrorResponse('Failed to load security dashboard', 500)
  }
}

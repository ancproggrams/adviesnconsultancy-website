
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { AlertManager, SecurityLogger } from '@/lib/security-week2'
import { createSecureApiResponse, createErrorResponse } from '@/lib/security-enhanced'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

// Get active security alerts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return createErrorResponse('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const includeAcknowledged = searchParams.get('includeAcknowledged') === 'true'

    const where: any = { triggered: true }
    if (!includeAcknowledged) {
      where.acknowledged = false
    }

    const alerts = await prisma.securityAlert.findMany({
      where,
      orderBy: [
        { severity: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Get alert statistics
    const alertStats = await prisma.securityAlert.groupBy({
      by: ['severity'],
      where: { triggered: true, acknowledged: false },
      _count: true
    })

    return createSecureApiResponse({
      alerts,
      statistics: {
        total: alerts.length,
        unacknowledged: alerts.filter((a: any) => !a.acknowledged).length,
        bySeverity: alertStats
      }
    })
  } catch (error) {
    console.error('Security alerts GET error:', error)
    return createErrorResponse('Failed to load security alerts', 500)
  }
}

// Acknowledge security alert
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return createErrorResponse('Unauthorized', 401)
    }

    const adminId = session.user.id
    const body = await request.json()
    const { alertId } = body

    if (!alertId) {
      return createErrorResponse('Alert ID is required', 400)
    }

    // Acknowledge the alert
    const acknowledgedAlert = await AlertManager.acknowledgeAlert(alertId, adminId)

    await SecurityLogger.logEvent('SECURITY_ALERT_ACKNOWLEDGED', 'LOW', {
      alertId,
      acknowledgedBy: adminId,
      alertType: acknowledgedAlert.type
    })

    return createSecureApiResponse({
      message: 'Security alert acknowledged',
      alert: acknowledgedAlert
    })
  } catch (error) {
    console.error('Alert acknowledgment error:', error)
    return createErrorResponse('Failed to acknowledge alert', 500)
  }
}

// Run security threshold checks (for scheduled monitoring)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Check if user has admin privileges
    const admin = await prisma.admin.findUnique({
      where: { id: session.user.id }
    })

    if (!admin || !['SUPER_ADMIN', 'ADMIN'].includes(admin.role)) {
      return createErrorResponse('Insufficient permissions', 403)
    }

    // Run security threshold checks
    await AlertManager.checkSecurityThresholds()

    await SecurityLogger.logEvent('SECURITY_THRESHOLD_CHECK', 'LOW', {
      triggeredBy: session.user.id,
      timestamp: new Date()
    })

    return createSecureApiResponse({
      message: 'Security threshold check completed'
    })
  } catch (error) {
    console.error('Security threshold check error:', error)
    return createErrorResponse('Failed to run security checks', 500)
  }
}

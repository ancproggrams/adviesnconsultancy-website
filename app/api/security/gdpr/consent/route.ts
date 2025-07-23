
import { NextRequest } from 'next/server'
import { GdprManager, SecurityLogger, consentSchema } from '@/lib/security-week2'
import { createSecureApiResponse, createErrorResponse } from '@/lib/security-enhanced'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

// Record user consent
export async function POST(request: NextRequest) {
  try {
    const ip = request.ip || request.headers.get('X-Forwarded-For') || 'unknown'
    const userAgent = request.headers.get('User-Agent') || 'unknown'

    const body = await request.json()
    const validation = consentSchema.safeParse(body)

    if (!validation.success) {
      return createErrorResponse('Invalid consent data: ' + validation.error.message, 400)
    }

    const { email, consentType, hasConsent, source } = validation.data

    // Record consent
    const consentRecord = await GdprManager.recordConsent(
      email,
      consentType,
      hasConsent,
      source,
      ip,
      userAgent
    )

    await SecurityLogger.logEvent('CONSENT_RECORDED', 'LOW', {
      email,
      consentType,
      hasConsent,
      source,
      ipAddress: ip
    })

    return createSecureApiResponse({
      message: 'Consent recorded successfully',
      consentId: consentRecord.id,
      timestamp: consentRecord.createdAt
    }, 201)
  } catch (error) {
    console.error('Consent recording error:', error)
    return createErrorResponse('Failed to record consent', 500)
  }
}

// Get consent status for email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return createErrorResponse('Email parameter is required', 400)
    }

    // Get latest consent records for each type
    const consentTypes = ['marketing', 'analytics', 'functional']
    const consentStatus: Record<string, any> = {}

    for (const type of consentTypes) {
      const latestConsent = await prisma.consentRecord.findFirst({
        where: { email, consentType: type },
        orderBy: { createdAt: 'desc' }
      })

      consentStatus[type] = {
        hasConsent: latestConsent?.hasConsent || false,
        lastUpdated: latestConsent?.createdAt,
        source: latestConsent?.consentSource,
        withdrawnAt: latestConsent?.withdrawnAt
      }
    }

    return createSecureApiResponse({
      email,
      consentStatus
    })
  } catch (error) {
    console.error('Consent status error:', error)
    return createErrorResponse('Failed to get consent status', 500)
  }
}

// Withdraw consent
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, consentType } = body

    if (!email || !consentType) {
      return createErrorResponse('Email and consent type are required', 400)
    }

    // Withdraw consent
    const result = await GdprManager.withdrawConsent(email, consentType)

    await SecurityLogger.logEvent('CONSENT_WITHDRAWN', 'MEDIUM', {
      email,
      consentType,
      withdrawnRecords: result.count
    })

    return createSecureApiResponse({
      message: 'Consent withdrawn successfully',
      email,
      consentType,
      withdrawnAt: new Date()
    })
  } catch (error) {
    console.error('Consent withdrawal error:', error)
    return createErrorResponse('Failed to withdraw consent', 500)
  }
}

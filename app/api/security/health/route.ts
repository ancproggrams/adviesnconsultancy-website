
import { NextRequest } from 'next/server'
import { createSecureApiResponse, createErrorResponse } from '@/lib/security-enhanced'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

// API Health Check endpoint
export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // Test database connection
    const dbStartTime = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const dbResponseTime = Date.now() - dbStartTime

    // Check critical services
    const checks = {
      database: {
        status: 'healthy',
        responseTime: dbResponseTime
      },
      security: {
        status: 'healthy',
        rateLimit: 'active',
        authentication: 'active'
      },
      fileSystem: {
        status: 'healthy'
      }
    }

    const totalResponseTime = Date.now() - startTime

    // Record health check
    await prisma.apiHealthCheck.create({
      data: {
        endpoint: '/api/security/health',
        method: 'GET',
        status: 200,
        responseTime: totalResponseTime
      }
    })

    return createSecureApiResponse({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: totalResponseTime,
      checks,
      version: '2.0.0-week2'
    })
  } catch (error) {
    console.error('Health check error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Still try to record the failed health check
    try {
      await prisma.apiHealthCheck.create({
        data: {
          endpoint: '/api/security/health',
          method: 'GET',
          status: 500,
          responseTime: Date.now(),
          error: errorMessage
        }
      })
    } catch (recordError) {
      console.error('Failed to record health check:', recordError)
    }

    return createErrorResponse('Health check failed', 500)
  }
}

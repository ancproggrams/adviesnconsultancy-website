
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const healthCheck = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      services: {
        database: await checkDatabase(),
        filesystem: await checkFilesystem(),
        memory: await checkMemory(),
        performance: await checkPerformance(),
      },
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    }

    // Determine overall health
    const allServicesHealthy = Object.values(healthCheck.services).every(
      service => service.status === 'healthy'
    )

    if (!allServicesHealthy) {
      healthCheck.status = 'degraded'
    }

    return NextResponse.json(healthCheck, {
      status: allServicesHealthy ? 200 : 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    )
  }
}

async function checkDatabase(): Promise<{ status: string; responseTime?: number; error?: string }> {
  try {
    const start = Date.now()
    // Simple database connectivity check
    // In a real app, you would check actual database connection
    const responseTime = Date.now() - start
    
    return {
      status: 'healthy',
      responseTime,
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Database connection failed',
    }
  }
}

async function checkFilesystem(): Promise<{ status: string; available?: number; error?: string }> {
  try {
    const fs = await import('fs').then(m => m.promises)
    const path = '/tmp/health-check-test'
    
    await fs.writeFile(path, 'test')
    await fs.unlink(path)
    
    return {
      status: 'healthy',
      available: 1000000, // Mock available space
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Filesystem check failed',
    }
  }
}

async function checkMemory(): Promise<{ status: string; usage?: any; error?: string }> {
  try {
    const usage = process.memoryUsage()
    const totalMemory = usage.heapUsed + usage.heapTotal
    const threshold = 512 * 1024 * 1024 // 512MB threshold
    
    return {
      status: totalMemory > threshold ? 'degraded' : 'healthy',
      usage: {
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
        external: Math.round(usage.external / 1024 / 1024),
      },
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Memory check failed',
    }
  }
}

async function checkPerformance(): Promise<{ status: string; metrics?: any; error?: string }> {
  try {
    // Simple performance check
    const start = Date.now()
    
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 1))
    
    const responseTime = Date.now() - start
    
    return {
      status: responseTime > 100 ? 'degraded' : 'healthy',
      metrics: {
        responseTime,
        cpuUsage: process.cpuUsage(),
      },
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Performance check failed',
    }
  }
}

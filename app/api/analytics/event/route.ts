
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { eventType, eventData, page, userId } = await request.json()
    
    // Get session ID from headers or generate one
    const sessionId = request.headers.get('x-session-id') || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Get client info
    const userAgent = request.headers.get('user-agent') || undefined
    const referrer = request.headers.get('referer') || undefined
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : 
                     request.headers.get('x-real-ip') || 
                     request.ip || 
                     'unknown'

    // Create analytics event
    await prisma.analyticsEvent.create({
      data: {
        sessionId,
        eventType,
        eventData: eventData || {},
        userAgent,
        ipAddress,
        referrer,
        page,
        userId,
        timestamp: new Date()
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Analytics event API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

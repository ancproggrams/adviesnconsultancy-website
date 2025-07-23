
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Web Vitals:', {
        metric: body.name,
        value: body.value,
        url: body.url,
        timestamp: new Date(body.timestamp).toISOString(),
      })
    }

    // In production, you would send this to your analytics service
    // For now, we'll just acknowledge receipt
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing web vitals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

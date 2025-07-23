
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Error Tracked:', {
        message: body.message,
        filename: body.filename,
        url: body.url,
        timestamp: new Date(body.timestamp).toISOString(),
      })
    }

    // In production, you would send this to your error tracking service
    // For now, we'll just acknowledge receipt
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing error report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

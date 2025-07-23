
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { NewsletterService } from '@/lib/newsletter'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Update subscriber status
    const subscriber = await prisma.newsletterSubscriber.update({
      where: { email },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    // Unsubscribe from Resend
    const newsletterService = NewsletterService.getInstance()
    await newsletterService.unsubscribe(email)

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    })
  } catch (error) {
    console.error('Newsletter unsubscription error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to unsubscribe from newsletter' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { NewsletterService } from '@/lib/newsletter'
import { NewsletterSignupData } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const data: NewsletterSignupData = await request.json()
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Check if already subscribed
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: data.email }
    })

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return NextResponse.json(
          { success: false, error: 'Email already subscribed' },
          { status: 400 }
        )
      } else {
        // Reactivate existing subscriber
        const updatedSubscriber = await prisma.newsletterSubscriber.update({
          where: { email: data.email },
          data: {
            isActive: true,
            name: data.name || existingSubscriber.name,
            company: data.company || existingSubscriber.company,
            preferences: data.preferences || existingSubscriber.preferences,
            source: data.source || existingSubscriber.source,
            updatedAt: new Date()
          }
        })

        // Send welcome email
        const newsletterService = NewsletterService.getInstance()
        await newsletterService.sendWelcomeEmail(updatedSubscriber)

        return NextResponse.json({
          success: true,
          data: updatedSubscriber,
          message: 'Successfully resubscribed to newsletter'
        })
      }
    }

    // Create new subscriber
    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email: data.email,
        name: data.name,
        company: data.company,
        preferences: data.preferences || ['IT-trends', 'Compliance', 'AI-insights'],
        source: data.source || 'website',
        leadScore: 10 // Initial lead score for newsletter signup
      }
    })

    // Subscribe to Resend and send welcome email
    const newsletterService = NewsletterService.getInstance()
    await newsletterService.subscribe(data)
    await newsletterService.sendWelcomeEmail(subscriber)

    // Track in analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'newsletter_signup', {
        event_category: 'engagement',
        event_label: data.source || 'website',
        value: 1
      })
    }

    return NextResponse.json({
      success: true,
      data: subscriber,
      message: 'Successfully subscribed to newsletter'
    })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    )
  }
}

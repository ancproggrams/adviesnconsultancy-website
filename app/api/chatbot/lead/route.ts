
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, name, email, company, phone } = await request.json()

    if (!sessionId || !name || !email) {
      return NextResponse.json({ error: 'SessionId, name, and email are required' }, { status: 400 })
    }

    // Update conversation with lead info
    await prisma.chatConversation.update({
      where: { sessionId },
      data: {
        userEmail: email,
        userName: name,
        userCompany: company,
        userPhone: phone,
        status: 'QUALIFIED',
        leadScore: 75 // Initial lead score for providing contact info
      }
    })

    // Create or update CRM contact
    await prisma.crmContact.upsert({
      where: { email },
      update: {
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' ') || '',
        company,
        phone,
        leadScore: 75,
        leadSource: 'chatbot',
        lastActivity: new Date()
      },
      create: {
        email,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' ') || '',
        company,
        phone,
        leadScore: 75,
        leadSource: 'chatbot',
        lastActivity: new Date()
      }
    })

    // Create CRM activity
    const crmContact = await prisma.crmContact.findUnique({
      where: { email }
    })

    if (crmContact) {
      await prisma.crmActivity.create({
        data: {
          contactId: crmContact.id,
          type: 'chatbot_lead_qualification',
          subject: 'Chatbot lead qualification completed',
          description: `Lead provided contact information through chatbot. Company: ${company || 'Not provided'}, Phone: ${phone || 'Not provided'}`,
          completedAt: new Date()
        }
      })
    }

    // Track analytics event
    await prisma.analyticsEvent.create({
      data: {
        sessionId,
        eventType: 'chatbot_lead_qualified',
        eventData: {
          name,
          email,
          company,
          phone,
          timestamp: new Date().toISOString()
        },
        page: 'chatbot'
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Chatbot lead API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

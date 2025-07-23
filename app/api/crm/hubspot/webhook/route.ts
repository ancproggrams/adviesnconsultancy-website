
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Verify HubSpot webhook signature (simplified)
    const signature = request.headers.get('X-HubSpot-Signature-V3')
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    // Process webhook events
    for (const event of body) {
      if (event.subscriptionType === 'contact.propertyChange') {
        await handleContactUpdate(event)
      } else if (event.subscriptionType === 'deal.creation') {
        await handleDealCreation(event)
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('HubSpot webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleContactUpdate(event: any) {
  const hubspotId = event.objectId.toString()
  
  // Find contact by HubSpot ID
  const contact = await prisma.crmContact.findUnique({
    where: { hubspotId }
  })

  if (contact) {
    // Update local contact with HubSpot changes
    await prisma.crmContact.update({
      where: { id: contact.id },
      data: {
        lastActivity: new Date(),
        syncedAt: new Date()
      }
    })
  }
}

async function handleDealCreation(event: any) {
  // Handle deal creation events
  // This could trigger follow-up workflows
  console.log('Deal created:', event)
}

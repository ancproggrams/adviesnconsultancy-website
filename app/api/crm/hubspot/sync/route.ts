
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// HubSpot API configuration
const HUBSPOT_API_BASE = 'https://api.hubapi.com'
const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY

export async function POST(request: NextRequest) {
  try {
    if (!HUBSPOT_API_KEY) {
      return NextResponse.json({ error: 'HubSpot API key not configured' }, { status: 400 })
    }

    const { contactId, type = 'contact' } = await request.json()

    if (type === 'contact') {
      if (!contactId) {
        return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 })
      }

      // Get contact from database
      const contact = await prisma.crmContact.findUnique({
        where: { id: contactId },
        include: { activities: true }
      })

      if (!contact) {
        return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
      }

      // Sync to HubSpot
      const hubspotContact = await syncContactToHubSpot(contact)
      
      // Update local contact with HubSpot ID
      await prisma.crmContact.update({
        where: { id: contactId },
        data: {
          hubspotId: hubspotContact.id,
          syncedAt: new Date()
        }
      })

      return NextResponse.json({ success: true, hubspotId: hubspotContact.id })
    }

    // Sync all contacts
    if (type === 'all') {
      const contacts = await prisma.crmContact.findMany({
        where: { hubspotId: null },
        include: { activities: true }
      })

      const results = []
      for (const contact of contacts) {
        try {
          const hubspotContact = await syncContactToHubSpot(contact)
          await prisma.crmContact.update({
            where: { id: contact.id },
            data: {
              hubspotId: hubspotContact.id,
              syncedAt: new Date()
            }
          })
          results.push({ id: contact.id, hubspotId: hubspotContact.id, status: 'success' })
        } catch (error) {
          results.push({ id: contact.id, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' })
        }
      }

      return NextResponse.json({ success: true, results })
    }

    return NextResponse.json({ error: 'Invalid sync type' }, { status: 400 })

  } catch (error) {
    console.error('HubSpot sync error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function syncContactToHubSpot(contact: any) {
  const hubspotData = {
    properties: {
      email: contact.email,
      firstname: contact.firstName,
      lastname: contact.lastName,
      company: contact.company || '',
      phone: contact.phone || '',
      jobtitle: contact.jobTitle || '',
      lifecyclestage: contact.lifecycleStage || 'subscriber',
      hs_lead_status: 'NEW',
      leadscore: contact.leadScore.toString(),
      lead_source: contact.leadSource || 'website'
    }
  }

  const response = await fetch(`${HUBSPOT_API_BASE}/crm/v3/objects/contacts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${HUBSPOT_API_KEY}`
    },
    body: JSON.stringify(hubspotData)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`HubSpot API error: ${error}`)
  }

  return await response.json()
}

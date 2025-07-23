
import { prisma } from '@/lib/db'
import { HubSpotContact, CrmContact } from '@/lib/types'

export class CrmIntegration {
  private hubspotApiKey: string
  private hubspotApiBase = 'https://api.hubapi.com'

  constructor(apiKey?: string) {
    this.hubspotApiKey = apiKey || process.env.HUBSPOT_API_KEY || ''
  }

  async createOrUpdateContact(contactData: {
    email: string
    firstName: string
    lastName: string
    company?: string
    phone?: string
    leadSource?: string
    leadScore?: number
  }): Promise<CrmContact> {
    // Create or update in local database
    const contact = await prisma.crmContact.upsert({
      where: { email: contactData.email },
      update: {
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        company: contactData.company,
        phone: contactData.phone,
        leadSource: contactData.leadSource,
        leadScore: contactData.leadScore || 0,
        lastActivity: new Date()
      },
      create: {
        email: contactData.email,
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        company: contactData.company,
        phone: contactData.phone,
        leadSource: contactData.leadSource || 'website',
        leadScore: contactData.leadScore || 0,
        lastActivity: new Date()
      },
      include: { activities: true }
    })

    // Sync to HubSpot if API key is configured
    if (this.hubspotApiKey) {
      try {
        await this.syncToHubSpot(contact)
      } catch (error) {
        console.error('HubSpot sync error:', error)
        // Continue without failing the entire operation
      }
    }

    return contact
  }

  async addActivity(contactId: string, activity: {
    type: string
    subject: string
    description?: string
    outcome?: string
  }): Promise<void> {
    await prisma.crmActivity.create({
      data: {
        contactId,
        type: activity.type,
        subject: activity.subject,
        description: activity.description,
        outcome: activity.outcome,
        completedAt: new Date()
      }
    })

    // Update contact last activity
    await prisma.crmContact.update({
      where: { id: contactId },
      data: { lastActivity: new Date() }
    })
  }

  async updateLeadScore(contactId: string, score: number): Promise<void> {
    await prisma.crmContact.update({
      where: { id: contactId },
      data: { leadScore: score }
    })
  }

  async getContactByEmail(email: string): Promise<CrmContact | null> {
    return await prisma.crmContact.findUnique({
      where: { email },
      include: { activities: true }
    })
  }

  async getTopLeads(limit: number = 10): Promise<CrmContact[]> {
    return await prisma.crmContact.findMany({
      where: { isActive: true },
      orderBy: { leadScore: 'desc' },
      take: limit,
      include: { activities: true }
    })
  }

  private async syncToHubSpot(contact: CrmContact): Promise<void> {
    if (!this.hubspotApiKey) return

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

    const response = await fetch(`${this.hubspotApiBase}/crm/v3/objects/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.hubspotApiKey}`
      },
      body: JSON.stringify(hubspotData)
    })

    if (response.ok) {
      const hubspotContact = await response.json()
      
      // Update local contact with HubSpot ID
      await prisma.crmContact.update({
        where: { id: contact.id },
        data: {
          hubspotId: hubspotContact.id,
          syncedAt: new Date()
        }
      })
    }
  }
}

// Global CRM instance
export const crm = new CrmIntegration()

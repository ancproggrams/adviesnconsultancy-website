
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const activities: Array<{
      id: string
      type: string
      title: string
      description: string
      user?: string
      userEmail?: string
      timestamp: string
      metadata?: any
    }> = []

    // Get recent chatbot conversations
    const recentChats = await prisma.chatConversation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { messages: true }
    })

    // Get recent QuickScan results
    const recentScans = await prisma.quickScanResult.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Get recent contacts
    const recentContacts = await prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Get recent CRM activities
    const recentCrmActivities = await prisma.crmActivity.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { contact: true }
    })

    // Convert chatbot conversations to activities
    recentChats.forEach((chat: any) => {
      activities.push({
        id: `chat_${chat.id}`,
        type: 'chatbot_conversation',
        title: `Nieuw chatbot gesprek ${chat.status === 'QUALIFIED' ? '(Gekwalificeerd)' : ''}`,
        description: `Gesprek met ${chat.userName || 'anonieme gebruiker'} - ${chat.messages.length} berichten`,
        user: chat.userName || undefined,
        userEmail: chat.userEmail || undefined,
        timestamp: chat.createdAt.toISOString(),
        metadata: {
          company: chat.userCompany,
          score: chat.leadScore,
          messageCount: chat.messages.length
        }
      })
    })

    // Convert QuickScan results to activities
    recentScans.forEach((scan: any) => {
      activities.push({
        id: `scan_${scan.id}`,
        type: 'quickscan_completed',
        title: `QuickScan voltooid${scan.wantsConsultation ? ' (Consultatie gewenst)' : ''}`,
        description: `${scan.name} voltooide de BCM QuickScan met score ${scan.overallScore}/5`,
        user: scan.name,
        userEmail: scan.email,
        timestamp: scan.createdAt.toISOString(),
        metadata: {
          company: scan.company,
          score: scan.overallScore,
          maturityLevel: scan.maturityLevel
        }
      })
    })

    // Convert contact form submissions to activities
    recentContacts.forEach((contact: any) => {
      activities.push({
        id: `contact_${contact.id}`,
        type: 'contact_form',
        title: `Nieuw contact formulier`,
        description: `${contact.name} verstuurde een contactformulier`,
        user: contact.name,
        userEmail: contact.email,
        timestamp: contact.createdAt.toISOString(),
        metadata: {
          company: contact.company,
          formType: contact.formType,
          interest: contact.interest
        }
      })
    })

    // Convert CRM activities
    recentCrmActivities.forEach((activity: any) => {
      activities.push({
        id: `crm_${activity.id}`,
        type: activity.type,
        title: activity.subject,
        description: activity.description || '',
        user: `${activity.contact.firstName} ${activity.contact.lastName}`,
        userEmail: activity.contact.email,
        timestamp: activity.createdAt.toISOString(),
        metadata: {
          company: activity.contact.company,
          outcome: activity.outcome
        }
      })
    })

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Take only the most recent 100 activities
    const recentActivities = activities.slice(0, 100)

    return NextResponse.json({
      activities: recentActivities
    })

  } catch (error) {
    console.error('Dashboard activities API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

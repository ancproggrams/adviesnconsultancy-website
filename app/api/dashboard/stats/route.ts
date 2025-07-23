
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get basic statistics
    const [
      totalLeads,
      qualifiedLeads,
      quickScansCompleted,
      chatConversations,
      activeCustomers,
      recentContacts,
      recentQuickScans
    ] = await Promise.all([
      prisma.crmContact.count({ where: { isActive: true } }),
      prisma.crmContact.count({ where: { leadScore: { gte: 60 }, isActive: true } }),
      prisma.quickScanResult.count(),
      prisma.chatConversation.count(),
      prisma.customer.count({ where: { isActive: true } }),
      prisma.crmContact.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.quickScanResult.count({ where: { createdAt: { gte: thirtyDaysAgo } } })
    ])

    // Calculate conversion rate
    const conversionRate = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0

    // Calculate monthly growth
    const monthlyGrowth = recentContacts > 0 ? Math.round(((recentContacts - (totalLeads - recentContacts)) / (totalLeads - recentContacts)) * 100) : 0

    // Get lead sources
    const leadSources = await prisma.crmContact.groupBy({
      by: ['leadSource'],
      _count: {
        id: true
      },
      where: {
        isActive: true
      }
    })

    const topLeadSources = leadSources.map(source => ({
      source: source.leadSource || 'website',
      count: source._count.id,
      percentage: Math.round((source._count.id / totalLeads) * 100)
    }))

    // Generate conversion data for chart (last 30 days)
    const conversionData = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      
      const dailyLeads = await prisma.crmContact.count({
        where: {
          createdAt: {
            gte: new Date(date.getTime()),
            lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      })
      
      const dailyQualified = await prisma.crmContact.count({
        where: {
          createdAt: {
            gte: new Date(date.getTime()),
            lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)
          },
          leadScore: { gte: 60 }
        }
      })

      conversionData.push({
        date: dateStr,
        conversionRate: dailyLeads > 0 ? Math.round((dailyQualified / dailyLeads) * 100) : 0,
        leads: dailyLeads,
        qualified: dailyQualified
      })
    }

    // Generate lead source data for pie chart
    const leadSourceData = leadSources.map(source => ({
      name: source.leadSource || 'Website',
      value: source._count.id
    }))

    const stats = {
      totalLeads,
      qualifiedLeads,
      conversionRate,
      quickScansCompleted,
      chatConversations,
      activeCustomers,
      monthlyGrowth,
      topLeadSources
    }

    return NextResponse.json({
      stats,
      conversionData,
      leadSourceData
    })

  } catch (error) {
    console.error('Dashboard stats API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

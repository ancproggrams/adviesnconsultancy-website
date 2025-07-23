
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get all leads with activities
    const leads = await prisma.crmContact.findMany({
      where: { isActive: true },
      include: {
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { leadScore: 'desc' }
    })

    // Generate lead score distribution data
    const leadScoreRanges = [
      { range: '0-20', min: 0, max: 20 },
      { range: '21-40', min: 21, max: 40 },
      { range: '41-60', min: 41, max: 60 },
      { range: '61-80', min: 61, max: 80 },
      { range: '81-100', min: 81, max: 100 }
    ]

    const leadScoreData = leadScoreRanges.map(range => ({
      range: range.range,
      count: leads.filter((lead: any) => lead.leadScore >= range.min && lead.leadScore <= range.max).length
    }))

    // Generate lead trend data (last 30 days)
    const leadTrendData = []
    const now = new Date()
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000)
      
      const dailyLeads = await prisma.crmContact.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate
          }
        }
      })

      leadTrendData.push({
        date: date.toISOString().split('T')[0],
        leads: dailyLeads
      })
    }

    return NextResponse.json({
      leads,
      leadScoreData,
      leadTrendData
    })

  } catch (error) {
    console.error('Dashboard leads API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

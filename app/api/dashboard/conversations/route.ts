
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get all conversations with messages
    const conversations = await prisma.chatConversation.findMany({
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    // Calculate statistics
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const totalConversations = conversations.length
    const recentConversations = conversations.filter((c: any) => new Date(c.createdAt) > thirtyDaysAgo).length
    const qualifiedConversations = conversations.filter((c: any) => c.status === 'QUALIFIED' || c.status === 'CONVERTED').length
    
    const stats = {
      total: totalConversations,
      qualified: qualifiedConversations,
      qualificationRate: totalConversations > 0 ? Math.round((qualifiedConversations / totalConversations) * 100) : 0,
      growthRate: totalConversations > 0 ? Math.round(((recentConversations - (totalConversations - recentConversations)) / (totalConversations - recentConversations)) * 100) : 0,
      averageDuration: '5m 30s', // This would need actual calculation based on message timestamps
      satisfactionScore: 85, // This would come from actual user feedback
      conversionTrend: [] as any[] // Initialize empty array
    }

    // Generate hourly conversation data
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour: hour.toString().padStart(2, '0') + ':00',
      conversations: conversations.filter((c: any) => new Date(c.createdAt).getHours() === hour).length
    }))

    // Generate conversion trend data (last 30 days)
    const conversionTrend = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000)
      
      const dailyConversations = conversations.filter((c: any) => {
        const createdAt = new Date(c.createdAt)
        return createdAt >= date && createdAt < nextDate
      })
      
      const dailyQualified = dailyConversations.filter((c: any) => c.status === 'QUALIFIED' || c.status === 'CONVERTED')
      
      conversionTrend.push({
        date: date.toISOString().split('T')[0],
        conversionRate: dailyConversations.length > 0 ? Math.round((dailyQualified.length / dailyConversations.length) * 100) : 0
      })
    }

    stats.conversionTrend = conversionTrend

    return NextResponse.json({
      conversations,
      stats,
      hourlyData
    })

  } catch (error) {
    console.error('Dashboard conversations API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

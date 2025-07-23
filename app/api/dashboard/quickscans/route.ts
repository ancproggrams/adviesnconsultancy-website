
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get all QuickScan results
    const quickScans = await prisma.quickScanResult.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    // Calculate statistics
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const totalScans = quickScans.length
    const recentScans = quickScans.filter((s: any) => new Date(s.createdAt) > thirtyDaysAgo).length
    const reportsGenerated = quickScans.filter((s: any) => s.reportGenerated).length
    const consultationsRequested = quickScans.filter((s: any) => s.wantsConsultation).length
    
    const averageScore = quickScans.length > 0 ? 
      Math.round((quickScans.reduce((sum: number, scan: any) => sum + scan.overallScore, 0) / quickScans.length) * 10) / 10 : 0

    const stats = {
      total: totalScans,
      averageScore,
      reportsGenerated,
      consultationsRequested,
      reportGenerationRate: totalScans > 0 ? Math.round((reportsGenerated / totalScans) * 100) : 0,
      consultationRate: totalScans > 0 ? Math.round((consultationsRequested / totalScans) * 100) : 0,
      growthRate: totalScans > 0 ? Math.round(((recentScans - (totalScans - recentScans)) / (totalScans - recentScans)) * 100) : 0,
      controlAreaScores: [] as any[] // Initialize empty array
    }

    // Generate maturity level distribution
    const maturityDistribution = quickScans.reduce((acc, scan) => {
      acc[scan.maturityLevel] = (acc[scan.maturityLevel] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const maturityData = Object.entries(maturityDistribution).map(([level, count]) => ({
      name: level,
      value: count
    }))

    // Generate trend data (last 30 days)
    const trendData = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000)
      
      const dailyScans = quickScans.filter(s => {
        const createdAt = new Date(s.createdAt)
        return createdAt >= date && createdAt < nextDate
      })
      
      trendData.push({
        date: date.toISOString().split('T')[0],
        scans: dailyScans.length
      })
    }

    // Generate control area scores
    const controlAreaScores = [
      { area: 'Context', averageScore: quickScans.length > 0 ? Math.round((quickScans.reduce((sum, scan) => sum + scan.contextScore, 0) / quickScans.length) * 10) / 10 : 0 },
      { area: 'Leiderschap', averageScore: quickScans.length > 0 ? Math.round((quickScans.reduce((sum, scan) => sum + scan.leadershipScore, 0) / quickScans.length) * 10) / 10 : 0 },
      { area: 'Planning', averageScore: quickScans.length > 0 ? Math.round((quickScans.reduce((sum, scan) => sum + scan.planningScore, 0) / quickScans.length) * 10) / 10 : 0 },
      { area: 'Ondersteuning', averageScore: quickScans.length > 0 ? Math.round((quickScans.reduce((sum, scan) => sum + scan.supportScore, 0) / quickScans.length) * 10) / 10 : 0 },
      { area: 'Operatie', averageScore: quickScans.length > 0 ? Math.round((quickScans.reduce((sum, scan) => sum + scan.operationScore, 0) / quickScans.length) * 10) / 10 : 0 },
      { area: 'Prestatie', averageScore: quickScans.length > 0 ? Math.round((quickScans.reduce((sum, scan) => sum + scan.performanceScore, 0) / quickScans.length) * 10) / 10 : 0 },
      { area: 'Verbetering', averageScore: quickScans.length > 0 ? Math.round((quickScans.reduce((sum, scan) => sum + scan.improvementScore, 0) / quickScans.length) * 10) / 10 : 0 }
    ]

    stats.controlAreaScores = controlAreaScores

    return NextResponse.json({
      quickScans,
      stats,
      maturityData,
      trendData
    })

  } catch (error) {
    console.error('Dashboard QuickScans API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

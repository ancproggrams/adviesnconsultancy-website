
import { NextRequest, NextResponse } from 'next/server'
import { PerformanceTracker, WebVitalsScorer } from '@/lib/performance-utils'

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page')
    const timeRange = searchParams.get('timeRange')

    const tracker = PerformanceTracker.getInstance()
    
    let filters: any = {}
    
    if (page) {
      filters.page = page
    }
    
    if (timeRange) {
      const now = Date.now()
      const ranges = {
        '1h': now - 3600000,
        '24h': now - 86400000,
        '7d': now - 604800000,
        '30d': now - 2592000000,
      }
      
      if (ranges[timeRange as keyof typeof ranges]) {
        filters.timeRange = {
          start: ranges[timeRange as keyof typeof ranges],
          end: now,
        }
      }
    }

    const metrics = tracker.getMetrics(filters)
    const report = tracker.generateReport()
    
    // Calculate Web Vitals scores
    const scoredMetrics = metrics.map(metric => ({
      ...metric,
      scores: {
        lcp: WebVitalsScorer.scoreLCP(metric.metrics.lcp),
        fid: WebVitalsScorer.scoreFID(metric.metrics.fid),
        cls: WebVitalsScorer.scoreCLS(metric.metrics.cls),
        fcp: WebVitalsScorer.scoreFCP(metric.metrics.fcp),
        ttfb: WebVitalsScorer.scoreTTFB(metric.metrics.ttfb),
        overall: WebVitalsScorer.getOverallScore(metric.metrics),
      },
    }))

    const response = {
      success: true,
      data: {
        metrics: scoredMetrics,
        report,
        summary: {
          totalSamples: metrics.length,
          averageScore: scoredMetrics.length > 0 
            ? scoredMetrics.reduce((acc, m) => acc + m.scores.overall, 0) / scoredMetrics.length
            : 0,
          goodMetrics: scoredMetrics.filter(m => m.scores.overall >= 75).length,
          poorMetrics: scoredMetrics.filter(m => m.scores.overall < 50).length,
        },
      },
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Response-Time': `${Date.now() - Date.now()}ms`,
      },
    })
  } catch (error) {
    console.error('Performance dashboard error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

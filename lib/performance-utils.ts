

import { NextRequest, NextResponse } from 'next/server'

export interface PerformanceMetrics {
  page: string
  metrics: {
    ttfb: number
    fcp: number
    lcp: number
    cls: number
    fid: number
  }
  timestamp: number
  userAgent: string
  connection?: string
}

export class PerformanceTracker {
  private static instance: PerformanceTracker
  private metrics: PerformanceMetrics[] = []
  private maxMetrics = 1000 // Keep last 1000 metrics

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker()
    }
    return PerformanceTracker.instance
  }

  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric)
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }
  }

  getMetrics(filters?: {
    page?: string
    timeRange?: { start: number; end: number }
  }): PerformanceMetrics[] {
    let filtered = this.metrics

    if (filters?.page) {
      filtered = filtered.filter(m => m.page === filters.page)
    }

    if (filters?.timeRange) {
      filtered = filtered.filter(m => 
        m.timestamp >= filters.timeRange!.start && 
        m.timestamp <= filters.timeRange!.end
      )
    }

    return filtered
  }

  getAverageMetrics(page?: string): any {
    const metrics = this.getMetrics(page ? { page } : undefined)
    
    if (metrics.length === 0) return null

    const totals = metrics.reduce((acc, metric) => {
      acc.ttfb += metric.metrics.ttfb
      acc.fcp += metric.metrics.fcp
      acc.lcp += metric.metrics.lcp
      acc.cls += metric.metrics.cls
      acc.fid += metric.metrics.fid
      return acc
    }, { ttfb: 0, fcp: 0, lcp: 0, cls: 0, fid: 0 })

    return {
      ttfb: totals.ttfb / metrics.length,
      fcp: totals.fcp / metrics.length,
      lcp: totals.lcp / metrics.length,
      cls: totals.cls / metrics.length,
      fid: totals.fid / metrics.length,
      sampleSize: metrics.length,
    }
  }

  generateReport(): any {
    const pages = [...new Set(this.metrics.map(m => m.page))]
    const report = {
      overview: this.getAverageMetrics(),
      pages: pages.map(page => ({
        page,
        metrics: this.getAverageMetrics(page),
      })),
      totalSamples: this.metrics.length,
      timeRange: {
        start: Math.min(...this.metrics.map(m => m.timestamp)),
        end: Math.max(...this.metrics.map(m => m.timestamp)),
      },
    }

    return report
  }
}

// Response time middleware
export function withPerformanceTracking(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const start = Date.now()
    
    try {
      const response = await handler(req)
      const duration = Date.now() - start
      
      // Add performance headers
      response.headers.set('X-Response-Time', `${duration}ms`)
      response.headers.set('X-Timestamp', new Date().toISOString())
      
      return response
    } catch (error) {
      const duration = Date.now() - start
      console.error(`API Error (${duration}ms):`, error)
      throw error
    }
  }
}

// Core Web Vitals scoring
export class WebVitalsScorer {
  static scoreLCP(lcp: number): 'good' | 'needs-improvement' | 'poor' {
    if (lcp <= 2500) return 'good'
    if (lcp <= 4000) return 'needs-improvement'
    return 'poor'
  }

  static scoreFID(fid: number): 'good' | 'needs-improvement' | 'poor' {
    if (fid <= 100) return 'good'
    if (fid <= 300) return 'needs-improvement'
    return 'poor'
  }

  static scoreCLS(cls: number): 'good' | 'needs-improvement' | 'poor' {
    if (cls <= 0.1) return 'good'
    if (cls <= 0.25) return 'needs-improvement'
    return 'poor'
  }

  static scoreFCP(fcp: number): 'good' | 'needs-improvement' | 'poor' {
    if (fcp <= 1800) return 'good'
    if (fcp <= 3000) return 'needs-improvement'
    return 'poor'
  }

  static scoreTTFB(ttfb: number): 'good' | 'needs-improvement' | 'poor' {
    if (ttfb <= 800) return 'good'
    if (ttfb <= 1800) return 'needs-improvement'
    return 'poor'
  }

  static getOverallScore(metrics: {
    lcp: number
    fid: number
    cls: number
    fcp: number
    ttfb: number
  }): number {
    const scores = {
      good: 3,
      'needs-improvement': 2,
      poor: 1,
    }

    const lcpScore = scores[this.scoreLCP(metrics.lcp)]
    const fidScore = scores[this.scoreFID(metrics.fid)]
    const clsScore = scores[this.scoreCLS(metrics.cls)]
    const fcpScore = scores[this.scoreFCP(metrics.fcp)]
    const ttfbScore = scores[this.scoreTTFB(metrics.ttfb)]

    // Weighted average (LCP and FID are most important)
    const totalScore = (lcpScore * 0.3 + fidScore * 0.3 + clsScore * 0.2 + fcpScore * 0.1 + ttfbScore * 0.1)
    
    return Math.round((totalScore / 3) * 100) // Convert to percentage
  }
}

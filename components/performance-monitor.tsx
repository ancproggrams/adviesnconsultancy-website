

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface PerformanceMetric {
  name: string
  value: number
  delta: number
  id: string
  navigationType: string
}

export function PerformanceMonitor() {
  const router = useRouter()

  useEffect(() => {
    let isReportingEnabled = true

    const reportWebVitals = (metric: PerformanceMetric) => {
      if (!isReportingEnabled) return

      // Send to our analytics API
      fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...metric,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
        }),
      }).catch(err => {
        console.warn('Failed to send web vitals:', err)
      })
    }

    // Core Web Vitals monitoring
    const observeWebVitals = async () => {
      try {
        const { onCLS, onFCP, onLCP, onTTFB } = await import('web-vitals')
        
        onCLS(reportWebVitals)
        onFCP(reportWebVitals)
        onLCP(reportWebVitals)
        onTTFB(reportWebVitals)
        
        // Try onINP (replacement for onFID) if available
        try {
          const { onINP } = await import('web-vitals')
          onINP(reportWebVitals)
        } catch {
          // onINP not available, skip
        }
      } catch (error) {
        console.warn('Web vitals library not available:', error)
      }
    }

    // Performance Observer for additional metrics
    const observePerformance = () => {
      if ('PerformanceObserver' in window) {
        try {
          // Long Task Observer
          const longTaskObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
              if (entry.duration > 50) {
                fetch('/api/analytics/performance', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    type: 'long-task',
                    duration: entry.duration,
                    startTime: entry.startTime,
                    url: window.location.href,
                    timestamp: Date.now(),
                  }),
                }).catch(() => {})
              }
            })
          })

          longTaskObserver.observe({ entryTypes: ['longtask'] })

          // Navigation Observer
          const navigationObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
              const navigationEntry = entry as PerformanceNavigationTiming
              fetch('/api/analytics/performance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'navigation',
                  domContentLoaded: navigationEntry.domContentLoadedEventEnd - navigationEntry.domContentLoadedEventStart,
                  loadComplete: navigationEntry.loadEventEnd - navigationEntry.loadEventStart,
                  url: window.location.href,
                  timestamp: Date.now(),
                }),
              }).catch(() => {})
            })
          })

          navigationObserver.observe({ entryTypes: ['navigation'] })

          // Resource Observer
          const resourceObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
              const resourceEntry = entry as PerformanceResourceTiming
              if (resourceEntry.duration > 1000) { // Resources taking more than 1 second
                fetch('/api/analytics/performance', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    type: 'slow-resource',
                    name: resourceEntry.name,
                    duration: resourceEntry.duration,
                    size: resourceEntry.transferSize,
                    url: window.location.href,
                    timestamp: Date.now(),
                  }),
                }).catch(() => {})
              }
            })
          })

          resourceObserver.observe({ entryTypes: ['resource'] })

        } catch (error) {
          console.warn('Performance Observer not fully supported:', error)
        }
      }
    }

    // Error tracking
    const handleError = (event: ErrorEvent) => {
      fetch('/api/analytics/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error?.toString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
        }),
      }).catch(() => {})
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      fetch('/api/analytics/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Unhandled Promise Rejection',
          error: event.reason?.toString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
        }),
      }).catch(() => {})
    }

    // Initialize monitoring
    observeWebVitals()
    observePerformance()
    
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      isReportingEnabled = false
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return null
}

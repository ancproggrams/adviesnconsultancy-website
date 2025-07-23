
'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { analytics } from '@/lib/analytics-enhanced'

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    // Track page views on route changes
    if (analytics) {
      analytics.trackEvent('pageview', {
        url: window.location.href,
        path: pathname,
        title: document.title,
        timestamp: new Date().toISOString()
      })
    }
  }, [pathname])

  useEffect(() => {
    // Initialize Microsoft Clarity
    const initClarity = () => {
      if (typeof window !== 'undefined' && !window.clarity) {
        (function(c: any, l: any, a: any, r: any, i: any) {
          c[a] = c[a] || function() {
            (c[a].q = c[a].q || []).push(arguments)
          }
          const t = l.createElement(r)
          t.async = 1
          t.src = 'https://www.clarity.ms/tag/' + i
          const y = l.getElementsByTagName(r)[0]
          y.parentNode.insertBefore(t, y)
        })(window, document, 'clarity', 'script', 'CLARITY_PROJECT_ID')
      }
    }

    initClarity()
  }, [])

  return <>{children}</>
}

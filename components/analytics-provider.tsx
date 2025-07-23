

'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import analytics from '@/lib/analytics'
import abTesting from '@/lib/ab-testing'
import leadScoring from '@/lib/lead-scoring'
import cookieConsent from '@/lib/cookie-consent'

interface AnalyticsProviderProps {
  children: React.ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname()
  const isInitialized = useRef(false)
  const pageStartTime = useRef<number>()
  const [isClient, setIsClient] = useState(false)

  // Set client-side flag to prevent SSR hydration errors
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isInitialized.current && isClient) {
      // Initialize all analytics systems
      const initializeAnalytics = async () => {
        try {
          // Initialize cookie consent first
          cookieConsent.initialize()
          
          // Initialize A/B testing
          abTesting.initialize()
          
          // Initialize lead scoring
          leadScoring.initialize()
          
          // Initialize analytics with consent callback
          cookieConsent.onConsentChange('analytics', (consent) => {
            if (consent.analytics) {
              // Initialize Google Analytics
              const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
              if (gaId) {
                analytics.initialize(gaId)
              }
              
              // Initialize Microsoft Clarity
              const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID
              if (clarityId) {
                analytics.initializeClarity(clarityId)
              }
            }
          })
          
          // Apply existing consent if available
          const existingConsent = cookieConsent.getSettings()
          if (existingConsent?.analytics) {
            const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
            if (gaId) {
              analytics.initialize(gaId)
            }
            
            const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID
            if (clarityId) {
              analytics.initializeClarity(clarityId)
            }
          }
          
          isInitialized.current = true
        } catch (error) {
          console.error('Analytics initialization failed:', error)
        }
      }

      initializeAnalytics()
    }
  }, [isClient])

  // Track page views
  useEffect(() => {
    if (isInitialized.current && isClient) {
      pageStartTime.current = Date.now()
      
      // Track page view
      analytics.trackPageView(pathname)
      
      // Process lead scoring for page visit
      leadScoring.processActivity('page_view', undefined, {
        page: pathname,
        timestamp: new Date().toISOString()
      })
      
      // Track specific page types
      if (pathname === '/contact' || pathname === '/adviesgesprek') {
        leadScoring.processActivity('contact_page_view', undefined, {
          page: pathname
        })
      } else if (pathname === '/diensten') {
        leadScoring.processActivity('services_page_view', undefined, {
          page: pathname
        })
      }
    }
  }, [pathname, isClient])

  // Track time on page
  useEffect(() => {
    if (!isClient) return

    const handleBeforeUnload = () => {
      if (pageStartTime.current) {
        const timeSpent = Date.now() - pageStartTime.current
        const timeSpentSeconds = Math.round(timeSpent / 1000)
        
        // Track significant time spent (more than 30 seconds)
        if (timeSpentSeconds > 30) {
          leadScoring.processActivity('time_on_site', undefined, {
            page: pathname,
            timeSpent: timeSpentSeconds
          })
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [pathname, isClient])

  // Track user engagement
  useEffect(() => {
    if (!isClient) return

    let scrollDepth = 0
    let maxScrollDepth = 0
    let interactions = 0

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      scrollDepth = Math.round((scrollTop / scrollHeight) * 100)
      
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth
        
        // Track deep scroll engagement
        if (maxScrollDepth > 75) {
          leadScoring.processActivity('high_engagement', undefined, {
            type: 'deep_scroll',
            scrollDepth: maxScrollDepth,
            page: pathname
          })
        }
      }
    }

    const handleClick = (e: MouseEvent) => {
      interactions++
      
      // Track high interaction engagement
      if (interactions > 5) {
        leadScoring.processActivity('high_engagement', undefined, {
          type: 'multiple_interactions',
          interactions,
          page: pathname
        })
      }
    }

    const handleKeyDown = () => {
      interactions++
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('click', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [pathname, isClient])

  // Track return visitors
  useEffect(() => {
    if (!isClient) return

    const lastVisit = localStorage.getItem('last_visit')
    const now = Date.now()
    
    if (lastVisit) {
      const timeSinceLastVisit = now - parseInt(lastVisit)
      // If more than 30 minutes since last visit, count as return visit
      if (timeSinceLastVisit > 30 * 60 * 1000) {
        leadScoring.processActivity('return_visit', undefined, {
          timeSinceLastVisit,
          page: pathname
        })
      }
    }
    
    localStorage.setItem('last_visit', now.toString())
  }, [pathname, isClient])

  return <>{children}</>
}

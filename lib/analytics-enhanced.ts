
import { prisma } from '@/lib/db'
import React from 'react'

declare global {
  interface Window {
    clarity: any
  }
}

export class AnalyticsTracker {
  private static instance: AnalyticsTracker
  private sessionId: string
  private userId?: string

  constructor() {
    this.sessionId = this.generateSessionId()
    this.initializeTracking()
  }

  static getInstance(): AnalyticsTracker {
    if (!AnalyticsTracker.instance) {
      AnalyticsTracker.instance = new AnalyticsTracker()
    }
    return AnalyticsTracker.instance
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeTracking() {
    // Initialize Microsoft Clarity
    this.initializeClarity()
    
    // Initialize custom tracking
    this.trackPageView()
    this.trackUserInteractions()
  }

  private initializeClarity() {
    // Microsoft Clarity tracking code
    const clarityScript = document.createElement('script')
    clarityScript.innerHTML = `
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "CLARITY_PROJECT_ID");
    `
    document.head.appendChild(clarityScript)
  }

  async trackEvent(eventType: string, eventData?: any) {
    try {
      const event = {
        sessionId: this.sessionId,
        eventType,
        eventData: eventData || {},
        userAgent: navigator.userAgent,
        page: window.location.pathname,
        referrer: document.referrer,
        timestamp: new Date().toISOString(),
        userId: this.userId
      }

      // Send to our analytics API
      await fetch('/api/analytics/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': this.sessionId
        },
        body: JSON.stringify(event)
      })

      // Send to Microsoft Clarity
      if (window.clarity) {
        window.clarity('event', eventType, eventData)
      }

    } catch (error) {
      console.error('Analytics tracking error:', error)
    }
  }

  private trackPageView() {
    this.trackEvent('pageview', {
      url: window.location.href,
      title: document.title,
      timestamp: new Date().toISOString()
    })
  }

  private trackUserInteractions() {
    // Track clicks on important elements
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      
      // Track button clicks
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const button = target.closest('button')
        this.trackEvent('button_click', {
          buttonText: button?.textContent?.trim(),
          buttonId: button?.id,
          buttonClass: button?.className
        })
      }

      // Track link clicks
      if (target.tagName === 'A' || target.closest('a')) {
        const link = target.closest('a')
        this.trackEvent('link_click', {
          url: link?.href,
          text: link?.textContent?.trim(),
          isExternal: link?.href?.startsWith('http') && !link?.href?.includes(window.location.hostname)
        })
      }

      // Track form submissions
      if ((target as HTMLInputElement).type === 'submit' || target.closest('form')) {
        const form = target.closest('form')
        this.trackEvent('form_interaction', {
          formId: form?.id,
          formClass: form?.className,
          action: form?.action
        })
      }
    })

    // Track scroll depth
    let maxScroll = 0
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent
        if (maxScroll % 25 === 0) { // Track at 25%, 50%, 75%, 100%
          this.trackEvent('scroll_depth', {
            percent: maxScroll,
            page: window.location.pathname
          })
        }
      }
    })

    // Track time on page
    let startTime = Date.now()
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Math.round((Date.now() - startTime) / 1000)
      this.trackEvent('page_time', {
        duration: timeOnPage,
        page: window.location.pathname
      })
    })
  }

  // Specific business events
  async trackQuickScanStart() {
    await this.trackEvent('quickscan_start', {
      page: window.location.pathname,
      timestamp: new Date().toISOString()
    })
  }

  async trackQuickScanComplete(results: any) {
    await this.trackEvent('quickscan_complete', {
      overallScore: results.overallScore,
      maturityLevel: results.maturityLevel,
      wantsConsultation: results.wantsConsultation,
      timestamp: new Date().toISOString()
    })
  }

  async trackContactFormSubmit(formData: any) {
    await this.trackEvent('contact_form_submit', {
      formType: formData.formType,
      interest: formData.interest,
      hasCompany: !!formData.company,
      hasPhone: !!formData.phone
    })
  }

  async trackChatbotInteraction(interactionType: string, data?: any) {
    await this.trackEvent('chatbot_interaction', {
      interactionType,
      ...data
    })
  }

  async trackNewsletterSignup(email: string) {
    await this.trackEvent('newsletter_signup', {
      email: email.includes('@') ? 'valid' : 'invalid',
      source: window.location.pathname
    })
  }

  async trackResourceDownload(resourceId: string, resourceType: string) {
    await this.trackEvent('resource_download', {
      resourceId,
      resourceType,
      page: window.location.pathname
    })
  }

  setUserId(userId: string) {
    this.userId = userId
  }

  // A/B Testing Support
  async trackABTest(testName: string, variant: string) {
    await this.trackEvent('ab_test_view', {
      testName,
      variant,
      page: window.location.pathname
    })
  }

  async trackConversion(conversionType: string, value?: number) {
    await this.trackEvent('conversion', {
      conversionType,
      value,
      page: window.location.pathname,
      timestamp: new Date().toISOString()
    })
  }
}

// Global analytics instance
export const analytics = typeof window !== 'undefined' ? AnalyticsTracker.getInstance() : null

// React hook for analytics
export function useAnalytics() {
  return analytics
}

// Higher-order component for automatic page tracking
export function withAnalytics<T extends {}>(Component: React.ComponentType<T>) {
  return function AnalyticsWrappedComponent(props: T) {
    React.useEffect(() => {
      if (analytics) {
        analytics.trackEvent('component_view', {
          componentName: Component.name,
          props: Object.keys(props as any)
        })
      }
    }, [props])

    return React.createElement(Component, props)
  }
}

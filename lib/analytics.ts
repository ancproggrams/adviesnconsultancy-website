

'use client'

// Google Analytics 4 Configuration
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

export interface AnalyticsEvent {
  action: string
  category: string
  label?: string
  value?: number
  custom_parameters?: Record<string, any>
}

export interface ConversionEvent {
  event_name: string
  currency?: string
  value?: number
  transaction_id?: string
  items?: any[]
  custom_parameters?: Record<string, any>
}

export interface UserProperties {
  user_id?: string
  email?: string
  name?: string
  user_type?: string
  lead_score?: number
  engagement_level?: string
  subscription_status?: string
}

class AnalyticsManager {
  private isInitialized = false
  private consentGiven = false
  private isTestMode = false
  private userId?: string
  private leadScore = 0
  private engagementLevel = 'low'

  constructor() {
    this.isTestMode = process.env.NODE_ENV === 'development'
    this.initializeFromStorage()
  }

  private initializeFromStorage() {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return
      }
      
      const storedConsent = localStorage.getItem('analytics_consent')
      this.consentGiven = storedConsent === 'true'
      
      const storedUserId = localStorage.getItem('analytics_user_id')
      if (storedUserId) {
        this.userId = storedUserId
      }
      
      const storedLeadScore = localStorage.getItem('lead_score')
      if (storedLeadScore) {
        this.leadScore = parseInt(storedLeadScore, 10)
      }
      
      const storedEngagementLevel = localStorage.getItem('engagement_level')
      if (storedEngagementLevel) {
        this.engagementLevel = storedEngagementLevel
      }
    } catch (error) {
      console.warn('Analytics: Could not load from localStorage:', error)
    }
  }

  async initialize(measurementId: string) {
    if (this.isInitialized) return

    try {
      // Initialize Google Analytics 4
      const script = document.createElement('script')
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
      script.async = true
      document.head.appendChild(script)

      window.dataLayer = window.dataLayer || []
      window.gtag = function() {
        window.dataLayer.push(arguments)
      }

      window.gtag('js', new Date())
      window.gtag('config', measurementId, {
        anonymize_ip: true,
        allow_ad_personalization_signals: this.consentGiven,
        allow_google_signals: this.consentGiven,
        cookie_flags: 'SameSite=Strict;Secure',
        custom_map: {
          'custom_user_id': 'user_id',
          'custom_lead_score': 'lead_score',
          'custom_engagement_level': 'engagement_level'
        }
      })

      this.isInitialized = true
      console.log('Analytics: GA4 initialized')
    } catch (error) {
      console.error('Analytics: Failed to initialize GA4:', error)
    }
  }

  setConsent(consent: boolean) {
    this.consentGiven = consent
    localStorage.setItem('analytics_consent', consent.toString())
    
    if (this.isInitialized) {
      window.gtag('consent', 'update', {
        'analytics_storage': consent ? 'granted' : 'denied',
        'ad_storage': consent ? 'granted' : 'denied',
        'personalization_storage': consent ? 'granted' : 'denied'
      })
    }
  }

  setUserId(userId: string) {
    this.userId = userId
    localStorage.setItem('analytics_user_id', userId)
    
    if (this.isInitialized && this.consentGiven) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        user_id: userId
      })
    }
  }

  setUserProperties(properties: UserProperties) {
    if (properties.user_id) {
      this.setUserId(properties.user_id)
    }
    
    if (properties.lead_score !== undefined) {
      this.leadScore = properties.lead_score
      localStorage.setItem('lead_score', properties.lead_score.toString())
    }
    
    if (properties.engagement_level) {
      this.engagementLevel = properties.engagement_level
      localStorage.setItem('engagement_level', properties.engagement_level)
    }

    if (this.isInitialized && this.consentGiven) {
      window.gtag('set', 'user_properties', {
        custom_user_id: properties.user_id,
        custom_lead_score: properties.lead_score,
        custom_engagement_level: properties.engagement_level,
        user_type: properties.user_type,
        subscription_status: properties.subscription_status
      })
    }
  }

  trackEvent(event: AnalyticsEvent) {
    if (!this.consentGiven) return

    const eventData = {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      user_id: this.userId,
      lead_score: this.leadScore,
      engagement_level: this.engagementLevel,
      ...event.custom_parameters
    }

    if (this.isInitialized) {
      window.gtag('event', event.action, eventData)
    }

    if (this.isTestMode) {
      console.log('Analytics Event:', { action: event.action, ...eventData })
    }
  }

  trackConversion(conversion: ConversionEvent) {
    if (!this.consentGiven) return

    const conversionData = {
      currency: conversion.currency || 'EUR',
      value: conversion.value || 0,
      transaction_id: conversion.transaction_id,
      items: conversion.items,
      user_id: this.userId,
      lead_score: this.leadScore,
      engagement_level: this.engagementLevel,
      ...conversion.custom_parameters
    }

    if (this.isInitialized) {
      window.gtag('event', conversion.event_name, conversionData)
    }

    if (this.isTestMode) {
      console.log('Analytics Conversion:', { event_name: conversion.event_name, ...conversionData })
    }
  }

  trackPageView(url: string, title?: string) {
    if (!this.consentGiven) return

    const pageData = {
      page_title: title || document.title,
      page_location: window.location.href,
      page_path: url,
      user_id: this.userId,
      lead_score: this.leadScore,
      engagement_level: this.engagementLevel
    }

    if (this.isInitialized) {
      window.gtag('event', 'page_view', pageData)
    }

    if (this.isTestMode) {
      console.log('Analytics Page View:', pageData)
    }
  }

  // QuickScan specific tracking
  trackQuickScanStart(variant?: string) {
    this.trackEvent({
      action: 'quick_scan_start',
      category: 'engagement',
      label: variant || 'default',
      custom_parameters: {
        scan_variant: variant || 'default'
      }
    })
  }

  trackQuickScanProgress(questionNumber: number, totalQuestions: number) {
    const progress = Math.round((questionNumber / totalQuestions) * 100)
    
    this.trackEvent({
      action: 'quick_scan_progress',
      category: 'engagement',
      label: `question_${questionNumber}`,
      value: progress,
      custom_parameters: {
        question_number: questionNumber,
        total_questions: totalQuestions,
        progress_percentage: progress
      }
    })
  }

  trackQuickScanComplete(results: any, userEmail?: string) {
    this.trackConversion({
      event_name: 'quick_scan_complete',
      value: 50, // Assign value to QuickScan completion
      custom_parameters: {
        total_score: results.totalPercentage,
        maturity_level: results.maturityLevelNumber,
        user_email: userEmail,
        scan_completion_time: new Date().toISOString()
      }
    })
  }

  trackLeadCapture(email: string, name: string, source: string) {
    this.trackConversion({
      event_name: 'lead_capture',
      value: 25,
      custom_parameters: {
        lead_source: source,
        user_email: email,
        user_name: name,
        capture_timestamp: new Date().toISOString()
      }
    })
  }

  trackDownload(fileName: string, fileType: string) {
    this.trackEvent({
      action: 'file_download',
      category: 'engagement',
      label: fileName,
      custom_parameters: {
        file_name: fileName,
        file_type: fileType,
        download_timestamp: new Date().toISOString()
      }
    })
  }

  trackFormSubmission(formName: string, formData: any) {
    this.trackEvent({
      action: 'form_submit',
      category: 'engagement',
      label: formName,
      custom_parameters: {
        form_name: formName,
        form_fields: Object.keys(formData).length,
        submission_timestamp: new Date().toISOString()
      }
    })
  }

  // Lead scoring methods
  updateLeadScore(points: number, reason: string) {
    this.leadScore = Math.max(0, Math.min(100, this.leadScore + points))
    localStorage.setItem('lead_score', this.leadScore.toString())
    
    // Update engagement level based on score
    if (this.leadScore >= 80) {
      this.engagementLevel = 'very_high'
    } else if (this.leadScore >= 60) {
      this.engagementLevel = 'high'
    } else if (this.leadScore >= 40) {
      this.engagementLevel = 'medium'
    } else if (this.leadScore >= 20) {
      this.engagementLevel = 'low'
    } else {
      this.engagementLevel = 'very_low'
    }
    
    localStorage.setItem('engagement_level', this.engagementLevel)
    
    this.trackEvent({
      action: 'lead_score_update',
      category: 'lead_scoring',
      label: reason,
      value: this.leadScore,
      custom_parameters: {
        score_change: points,
        new_score: this.leadScore,
        engagement_level: this.engagementLevel,
        reason: reason
      }
    })
  }

  getLeadScore() {
    return this.leadScore
  }

  getEngagementLevel() {
    return this.engagementLevel
  }

  // Microsoft Clarity integration
  initializeClarity(clarityId: string) {
    if (!this.consentGiven) return

    try {
      const script = document.createElement('script')
      script.innerHTML = `
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${clarityId}");
      `
      document.head.appendChild(script)
      
      console.log('Analytics: Microsoft Clarity initialized')
    } catch (error) {
      console.error('Analytics: Failed to initialize Clarity:', error)
    }
  }

  // Hotjar integration as alternative
  initializeHotjar(hotjarId: string) {
    if (!this.consentGiven) return

    try {
      const script = document.createElement('script')
      script.innerHTML = `
        (function(h,o,t,j,a,r){
          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:${hotjarId},hjsv:6};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `
      document.head.appendChild(script)
      
      console.log('Analytics: Hotjar initialized')
    } catch (error) {
      console.error('Analytics: Failed to initialize Hotjar:', error)
    }
  }
}

// Create singleton instance
const analytics = new AnalyticsManager()

export default analytics

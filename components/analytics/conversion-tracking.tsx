
'use client'

import { useEffect } from 'react'
import { analytics } from '@/lib/analytics-enhanced'

interface ConversionTrackingProps {
  conversionType: string
  value?: number
  metadata?: Record<string, any>
}

export function ConversionTracking({ conversionType, value, metadata }: ConversionTrackingProps) {
  useEffect(() => {
    if (analytics) {
      analytics.trackConversion(conversionType, value)
      
      // Track additional conversion metrics
      analytics.trackEvent('conversion_detailed', {
        conversionType,
        value,
        metadata,
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        referrer: document.referrer
      })
    }
  }, [conversionType, value, metadata])

  return null
}

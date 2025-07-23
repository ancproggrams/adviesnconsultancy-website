

'use client'

export interface CookieConsentSettings {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  preferences: boolean
  lastUpdated: Date
  consentVersion: string
}

export type CookieCategory = 'necessary' | 'analytics' | 'marketing' | 'preferences'

export interface CookieInfo {
  name: string
  purpose: string
  category: 'necessary' | 'analytics' | 'marketing' | 'preferences'
  expiry: string
  provider: string
}

class CookieConsentManager {
  private static instance: CookieConsentManager
  private settings: CookieConsentSettings | null = null
  private consentVersion = '1.0'
  private isInitialized = false
  private callbacks: Map<string, (consent: CookieConsentSettings) => void> = new Map()

  constructor() {
    this.loadSettings()
  }

  static getInstance(): CookieConsentManager {
    if (!CookieConsentManager.instance) {
      CookieConsentManager.instance = new CookieConsentManager()
    }
    return CookieConsentManager.instance
  }

  private loadSettings() {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return
      }
      
      const stored = localStorage.getItem('cookie_consent_settings')
      if (stored) {
        const parsed = JSON.parse(stored)
        this.settings = {
          ...parsed,
          lastUpdated: new Date(parsed.lastUpdated)
        }
      }
    } catch (error) {
      console.warn('Cookie Consent: Could not load settings:', error)
    }
  }

  private saveSettings() {
    if (this.settings) {
      try {
        localStorage.setItem('cookie_consent_settings', JSON.stringify(this.settings))
      } catch (error) {
        console.warn('Cookie Consent: Could not save settings:', error)
      }
    }
  }

  initialize() {
    if (this.isInitialized) return

    // Check if consent is needed
    if (!this.settings || this.settings.consentVersion !== this.consentVersion) {
      this.showConsentBanner()
    } else {
      this.applyConsentSettings()
    }

    this.isInitialized = true
  }

  private showConsentBanner() {
    // This will be handled by the CookieConsentBanner component
    const event = new CustomEvent('showCookieConsent', { detail: { manager: this } })
    window.dispatchEvent(event)
  }

  setConsent(settings: Partial<CookieConsentSettings>) {
    this.settings = {
      necessary: true, // Always required
      analytics: settings.analytics ?? false,
      marketing: settings.marketing ?? false,
      preferences: settings.preferences ?? false,
      lastUpdated: new Date(),
      consentVersion: this.consentVersion
    }

    this.saveSettings()
    this.applyConsentSettings()
    this.notifyCallbacks()
  }

  private applyConsentSettings() {
    if (!this.settings) return

    // Set consent for analytics
    if (this.settings.analytics) {
      this.enableAnalytics()
    } else {
      this.disableAnalytics()
    }

    // Set consent for marketing
    if (this.settings.marketing) {
      this.enableMarketing()
    } else {
      this.disableMarketing()
    }

    // Set consent for preferences
    if (this.settings.preferences) {
      this.enablePreferences()
    } else {
      this.disablePreferences()
    }
  }

  private enableAnalytics() {
    // Enable Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted'
      })
    }
  }

  private disableAnalytics() {
    // Disable Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied'
      })
    }
  }

  private enableMarketing() {
    // Enable marketing cookies
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'ad_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted'
      })
    }
  }

  private disableMarketing() {
    // Disable marketing cookies
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied'
      })
    }
  }

  private enablePreferences() {
    // Enable preferences cookies (theme, language, etc.)
    // Already handled by existing theme and language providers
  }

  private disablePreferences() {
    // Disable preferences cookies
    // Note: This might affect user experience
  }

  private notifyCallbacks() {
    if (this.settings) {
      this.callbacks.forEach(callback => {
        try {
          callback(this.settings!)
        } catch (error) {
          console.error('Cookie Consent: Callback error:', error)
        }
      })
    }
  }

  getSettings(): CookieConsentSettings | null {
    return this.settings
  }

  hasConsent(category: CookieCategory): boolean {
    return this.settings?.[category] ?? false
  }

  isConsentRequired(): boolean {
    return !this.settings || this.settings.consentVersion !== this.consentVersion
  }

  onConsentChange(id: string, callback: (consent: CookieConsentSettings) => void) {
    this.callbacks.set(id, callback)
  }

  removeConsentCallback(id: string) {
    this.callbacks.delete(id)
  }

  revokeConsent() {
    this.settings = null
    localStorage.removeItem('cookie_consent_settings')
    this.clearAllCookies()
    this.showConsentBanner()
  }

  private clearAllCookies() {
    // Clear all non-necessary cookies
    const cookies = document.cookie.split(';')
    const necessaryCookies = ['theme-preference', 'lang-preference', 'cookie_consent_settings']
    
    cookies.forEach(cookie => {
      const [name] = cookie.split('=')
      const cleanName = name.trim()
      
      if (!necessaryCookies.includes(cleanName)) {
        // Clear cookie
        document.cookie = `${cleanName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`
        document.cookie = `${cleanName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      }
    })

    // Clear localStorage items (except necessary ones)
    const necessaryStorageItems = ['theme-preference', 'lang-preference', 'cookie_consent_settings']
    Object.keys(localStorage).forEach(key => {
      if (!necessaryStorageItems.includes(key)) {
        localStorage.removeItem(key)
      }
    })
  }

  getCookieInfo(): CookieInfo[] {
    return [
      {
        name: 'theme-preference',
        purpose: 'Remembers your theme preference (light/dark mode)',
        category: 'preferences',
        expiry: '1 year',
        provider: 'Advies N Consultancy'
      },
      {
        name: 'lang-preference',
        purpose: 'Remembers your language preference',
        category: 'preferences',
        expiry: '1 year',
        provider: 'Advies N Consultancy'
      },
      {
        name: '_ga',
        purpose: 'Used to distinguish users for Google Analytics',
        category: 'analytics',
        expiry: '2 years',
        provider: 'Google'
      },
      {
        name: '_ga_*',
        purpose: 'Used to persist session state for Google Analytics',
        category: 'analytics',
        expiry: '2 years',
        provider: 'Google'
      },
      {
        name: '_gid',
        purpose: 'Used to distinguish users for Google Analytics',
        category: 'analytics',
        expiry: '24 hours',
        provider: 'Google'
      },
      {
        name: '_gat',
        purpose: 'Used to throttle request rate for Google Analytics',
        category: 'analytics',
        expiry: '1 minute',
        provider: 'Google'
      },
      {
        name: '_clck',
        purpose: 'Microsoft Clarity cookie for user session tracking',
        category: 'analytics',
        expiry: '1 year',
        provider: 'Microsoft'
      },
      {
        name: '_clsk',
        purpose: 'Microsoft Clarity cookie for session recordings',
        category: 'analytics',
        expiry: '1 day',
        provider: 'Microsoft'
      },
      {
        name: 'ab_test_*',
        purpose: 'Remembers A/B test assignments to ensure consistent experience',
        category: 'preferences',
        expiry: '30 days',
        provider: 'Advies N Consultancy'
      },
      {
        name: 'lead_scoring_*',
        purpose: 'Tracks user interactions for lead scoring and personalization',
        category: 'analytics',
        expiry: '1 year',
        provider: 'Advies N Consultancy'
      }
    ]
  }

  // Utility methods
  acceptAll() {
    this.setConsent({
      analytics: true,
      marketing: true,
      preferences: true
    })
  }

  rejectAll() {
    this.setConsent({
      analytics: false,
      marketing: false,
      preferences: false
    })
  }

  acceptNecessaryOnly() {
    this.setConsent({
      analytics: false,
      marketing: false,
      preferences: false
    })
  }
}

// Create singleton instance
const cookieConsent = CookieConsentManager.getInstance()

export default cookieConsent



'use client'

import { useState, useEffect, ReactNode } from 'react'
import { Language, LanguageContext, translations } from '@/lib/i18n'

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always default to 'nl' for complete SSR consistency
  const [language, setLanguageState] = useState<Language>('nl')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Mark as client-side mounted
    setIsClient(true)
    
    // Only read localStorage after client-side mount to prevent hydration mismatch
    try {
      const savedLanguage = localStorage.getItem('preferred-language') as Language
      if (savedLanguage && (savedLanguage === 'nl' || savedLanguage === 'en')) {
        // Only update if different from default to prevent unnecessary re-renders
        if (savedLanguage !== 'nl') {
          setLanguageState(savedLanguage)
        }
        document.documentElement.lang = savedLanguage
      } else {
        document.documentElement.lang = 'nl'
      }
    } catch (error) {
      // Fallback if localStorage is not available
      console.warn('localStorage not available:', error)
      document.documentElement.lang = 'nl'
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    document.documentElement.lang = lang
    
    // Only save to localStorage if client-side is ready
    if (isClient) {
      try {
        localStorage.setItem('preferred-language', lang)
      } catch (error) {
        console.warn('Failed to save language preference:', error)
      }
    }
  }

  // Deterministic translation function that always uses 'nl' for initial render
  const t = (key: string, fallback?: string): string => {
    // For SSR and initial client render, always use 'nl' to ensure consistency
    const effectiveLanguage = isClient ? language : 'nl'
    return translations[effectiveLanguage]?.[key] || translations.nl[key] || fallback || key
  }

  const contextValue = { language, setLanguage, t }

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  )
}

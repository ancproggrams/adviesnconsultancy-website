

'use client'

import { createContext, useContext } from 'react'

export type Language = 'nl' | 'en'

export interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, fallback?: string) => string
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const translations: Record<Language, Record<string, string>> = {
  nl: {
    'nav.home': 'Home',
    'nav.services': 'Diensten',
    'nav.knowledge': 'Kenniscentrum',
    'nav.compliance': 'Compliance Automation',
    'nav.about': 'Over Ons',
    'nav.consultation': 'Adviesgesprek',
    'nav.quickscan': 'Quick Scan',
    'common.contact': 'Contact',
    'hero.title': 'IT-Consultancy & Compliance Experts',
    'hero.subtitle': 'Professionele ondersteuning voor business continuïteit',
    'footer.company': 'Advies N Consultancy BV',
    'footer.description': 'Professionele IT-consultancy en compliance experts',
    'footer.rights': 'Alle rechten voorbehouden',
    'footer.links.services': 'Diensten',
    'footer.links.about': 'Over ons',
    'footer.links.contact': 'Contact',
    'services.it.title': 'IT Consultancy',
    'services.compliance.title': 'Compliance Automatisering',
    'services.ai.title': 'AI Outsourcing',
    'contact.info.address': 'Voorburg, Nederland',
    'contact.info.email': 'info@adviesnconsultancy.nl',
    'contact.info.phone': '+31 (0)70 123 4567',
    'a11y.skipToContent': 'Ga naar hoofdinhoud',
    'a11y.toggleTheme': 'Schakel tussen licht en donker thema',
    'a11y.toggleLanguage': 'Wijzig taal',
    'a11y.openMenu': 'Open menu',
    'a11y.closeMenu': 'Sluit menu'
  },
  en: {
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.knowledge': 'Knowledge Center',
    'nav.compliance': 'Compliance Automation',
    'nav.about': 'About Us',
    'nav.consultation': 'Consultation',
    'nav.quickscan': 'Quick Scan',
    'common.contact': 'Contact',
    'hero.title': 'IT Consultancy & Compliance Experts',
    'hero.subtitle': 'Professional support for business continuity',
    'footer.company': 'Advies N Consultancy BV',
    'footer.description': 'Professional IT consultancy and compliance experts',
    'footer.rights': 'All rights reserved',
    'footer.links.services': 'Services',
    'footer.links.about': 'About us',
    'footer.links.contact': 'Contact',
    'services.it.title': 'IT Consultancy',
    'services.compliance.title': 'Compliance Automation',
    'services.ai.title': 'AI Outsourcing',
    'contact.info.address': 'Voorburg, Netherlands',
    'contact.info.email': 'info@adviesnconsultancy.nl',
    'contact.info.phone': '+31 (0)70 123 4567',
    'a11y.skipToContent': 'Skip to main content',
    'a11y.toggleTheme': 'Toggle between light and dark theme',
    'a11y.toggleLanguage': 'Change language',
    'a11y.openMenu': 'Open menu',
    'a11y.closeMenu': 'Close menu'
  }
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export function useTranslation() {
  const { t } = useLanguage()
  return { t }
}

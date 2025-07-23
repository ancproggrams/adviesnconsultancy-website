

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ChatbotManager } from '@/components/chatbot/chatbot-manager'
// COMMENTED OUT FOR TESTING HYDRATION ISSUES
// import { Toaster } from '@/components/ui/toaster'
// import { StructuredData } from '@/components/structured-data'
// import { PerformanceMonitor } from '@/components/performance-monitor'
// import { PWAManager } from '@/components/pwa-manager'
// import { PWAInstallPrompt } from '@/components/pwa-install-prompt'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://adviesnconsultancy.nl'),
  title: {
    default: 'Advies N Consultancy BV - IT Consultancy & Compliance Experts',
    template: '%s | Advies N Consultancy BV'
  },
  description: 'Professionele IT-consultancy gespecialiseerd in business continuïteit, compliance, AI-automatisering en digitale transformatie. ISO 22301 gecertificeerd. Voorburg, Nederland.',
  keywords: [
    'IT consultancy Nederland',
    'business continuïteit',
    'compliance automatisering',
    'AI outsourcing',
    'digitale transformatie',
    'ISO 22301',
    'cybersecurity',
    'IT advisory',
    'Voorburg',
    'Den Haag'
  ],
  authors: [{ name: 'Marc van der Meer', url: 'https://adviesnconsultancy.nl' }],
  creator: 'Advies N Consultancy BV',
  publisher: 'Advies N Consultancy BV',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Advies N Consultancy BV - IT Consultancy & Compliance Experts',
    description: 'Professionele IT-consultancy gespecialiseerd in business continuïteit, compliance, AI-automatisering en digitale transformatie.',
    url: 'https://adviesnconsultancy.nl',
    siteName: 'Advies N Consultancy BV',
    locale: 'nl_NL',
    type: 'website',
    images: [
      {
        url: '/ANCLOGO.jpeg',
        width: 1200,
        height: 630,
        alt: 'Advies N Consultancy BV Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Advies N Consultancy BV - IT Consultancy & Compliance',
    description: 'Professionele IT-consultancy gespecialiseerd in business continuïteit, compliance en AI-automatisering.',
    images: ['/ANCLOGO.jpeg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://adviesnconsultancy.nl',
  },
  verification: {
    google: 'your-google-site-verification-code',
  },
  category: 'business',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl" suppressHydrationWarning={true}>
      <head>
        <link rel="canonical" href="https://adviesnconsultancy.nl" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1e40af" />
        <meta name="msapplication-TileColor" content="#1e40af" />
        <meta name="application-name" content="Advies N Consultancy BV" />
        <meta name="apple-mobile-web-app-title" content="Advies N Consultancy BV" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* PWA iOS Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        
        {/* <StructuredData /> */}
      </head>
      <body>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main id="main-content" className="flex-1" tabIndex={-1}>
              {children}
            </main>
            <SiteFooter />
          </div>
          <ChatbotManager />
        </Providers>
      </body>
    </html>
  )
}

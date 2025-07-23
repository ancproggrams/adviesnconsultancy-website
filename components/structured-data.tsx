
'use client'

import { useEffect } from 'react'

export function StructuredData() {
  useEffect(() => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Advies N Consultancy BV',
      alternateName: 'ANC',
      url: 'https://adviesnconsultancy.nl',
      logo: 'https://www.perfectmanage.eu/userfiles/40/images/Logo-nieuw-def.jpg',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+31622675520',
        contactType: 'customer service',
        areaServed: 'NL',
        availableLanguage: 'Dutch'
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Voorburg',
        addressRegion: 'Zuid-Holland',
        addressCountry: 'NL'
      },
      sameAs: [
        'https://www.linkedin.com/company/advies-n-consultancy-bv'
      ],
      description: 'Professionele IT-consultancy gespecialiseerd in business continuïteit, compliance, AI-automatisering en digitale transformatie.',
      foundingDate: '2020',
      industry: 'Information Technology',
      numberOfEmployees: '1-10',
      services: [
        'IT Consultancy',
        'Business Continuity Management',
        'Compliance Automation',
        'AI Outsourcing',
        'Digital Transformation'
      ],
      areaServed: {
        '@type': 'Country',
        name: 'Netherlands'
      }
    }

    const localBusinessData = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'Advies N Consultancy BV',
      image: 'https://advieskeuzecontent.blob.core.windows.net/images/87e0133c-d18d-4a95-bda0-fade12a0640d.jpg',
      '@id': 'https://adviesnconsultancy.nl',
      url: 'https://adviesnconsultancy.nl',
      telephone: '+31622675520',
      email: 'marc@adviesnconsultancy.nl',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '',
        addressLocality: 'Voorburg',
        postalCode: '',
        addressCountry: 'NL'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 52.0705,
        longitude: 4.3553
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday'
        ],
        opens: '09:00',
        closes: '17:00'
      },
      sameAs: [
        'https://www.linkedin.com/company/advies-n-consultancy-bv'
      ]
    }

    const serviceData = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'IT Consultancy Services',
      provider: {
        '@type': 'Organization',
        name: 'Advies N Consultancy BV'
      },
      serviceType: 'IT Consulting',
      description: 'Comprehensive IT consultancy services including business continuity, compliance automation, and AI solutions.',
      areaServed: {
        '@type': 'Country',
        name: 'Netherlands'
      }
    }

    // Add structured data to head
    const script1 = document.createElement('script')
    script1.type = 'application/ld+json'
    script1.textContent = JSON.stringify(structuredData)
    document.head.appendChild(script1)

    const script2 = document.createElement('script')
    script2.type = 'application/ld+json'
    script2.textContent = JSON.stringify(localBusinessData)
    document.head.appendChild(script2)

    const script3 = document.createElement('script')
    script3.type = 'application/ld+json'
    script3.textContent = JSON.stringify(serviceData)
    document.head.appendChild(script3)

    return () => {
      document.head.removeChild(script1)
      document.head.removeChild(script2)
      document.head.removeChild(script3)
    }
  }, [])

  return null
}

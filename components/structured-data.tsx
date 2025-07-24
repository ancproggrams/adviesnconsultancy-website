
'use client';

export function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Advies N Consultancy BV",
    "alternateName": "ANC",
    "url": "https://adviesnconsultancy.nl",
    "logo": "https://i.pinimg.com/736x/45/74/d0/4574d0eb6e2a598488bf2fbbb1c5ca10.jpg",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+31-70-123-4567",
      "contactType": "customer service",
      "availableLanguage": ["Dutch", "English"],
      "areaServed": "NL"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Voorburg",
      "addressLocality": "Voorburg",
      "addressRegion": "Zuid-Holland",
      "postalCode": "2270",
      "addressCountry": "NL"
    },
    "sameAs": [
      "https://www.linkedin.com/company/advies-n-consultancy-bv"
    ],
    "description": "Professionele IT-consultancy gespecialiseerd in business continuïteit, compliance, AI-automatisering en digitale transformatie.",
    "foundingDate": "2020",
    "industry": "IT Consultancy",
    "numberOfEmployees": "1-10",
    "knowsAbout": [
      "Business Continuity",
      "Compliance Automation",
      "AI Outsourcing",
      "Digital Transformation",
      "Cybersecurity",
      "ISO 22301"
    ]
  };

  const professionalServiceSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "Advies N Consultancy BV",
    "image": "https://advieskeuzecontent.blob.core.windows.net/images/87e0133c-d18d-4a95-bda0-fade12a0640d.jpg",
    "url": "https://adviesnconsultancy.nl",
    "telephone": "+31-70-123-4567",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Voorburg",
      "addressLocality": "Voorburg",
      "addressRegion": "Zuid-Holland",
      "postalCode": "2270",
      "addressCountry": "NL"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 52.0705,
      "longitude": 4.3553
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday", 
        "Wednesday",
        "Thursday",
        "Friday"
      ],
      "opens": "09:00",
      "closes": "17:00"
    },
    "priceRange": "€€€",
    "areaServed": "Netherlands",
    "serviceType": [
      "IT Consultancy",
      "Business Continuity Planning",
      "Compliance Automation",
      "AI Implementation",
      "Digital Transformation"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Advies N Consultancy BV",
    "url": "https://adviesnconsultancy.nl",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://adviesnconsultancy.nl/kenniscentrum?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Advies N Consultancy BV",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.perfectmanage.eu/userfiles/40/images/Logo-nieuw-def.jpg"
      }
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://adviesnconsultancy.nl"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Diensten",
        "item": "https://adviesnconsultancy.nl/diensten"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Over Ons",
        "item": "https://adviesnconsultancy.nl/over-ons"
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "Kenniscentrum",
        "item": "https://adviesnconsultancy.nl/kenniscentrum"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(professionalServiceSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />
    </>
  );
}

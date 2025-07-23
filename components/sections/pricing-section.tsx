

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function PricingSection() {
  const pricingPackages = [
    {
      title: 'Analyse & Voorbereiding',
      price: '€14.000',
      duration: '3-6 maanden',
      maturityLevel: 'Niveau 2',
      description: 'Inzicht krijgen in de huidige situatie en voorbereiding op implementatie en audit',
      features: [
        'Gap-analyse',
        'Scopebepaling BCM',
        'Business Impact Analyse voorbereiden',
        'BCM-beleid herzien',
        'Voorbereiden awareness & trainingsplan',
        'Voorlopige implementatieplanning',
        'BCMS voorbereiden'
      ],
      buttonText: 'Kies Pakket',
      buttonVariant: 'outline' as const,
      popular: false
    },
    {
      title: 'Implementatie & Versterking',
      price: '€22.000',
      duration: '6-12 maanden',
      maturityLevel: 'Niveau 4',
      description: 'BCM daadwerkelijk implementeren en klaarstomen voor audit',
      features: [
        'Implementatie van BCMS',
        'Training en bewustwording intern uitvoeren',
        'Testen en oefenen van plannen',
        'Continous SLA opstellen',
        'Inrichten van monitoring/KPI\'s',
        'Audit-proof documentatie'
      ],
      buttonText: 'Kies Pakket',
      buttonVariant: 'default' as const,
      popular: true
    },
    {
      title: 'Actieve Implementatiebegeleiding',
      price: '€49.000',
      duration: '12-24 maanden',
      maturityLevel: 'Niveau 5',
      description: 'Continuiteit structureel verankeren en audit succesvol doorlopen met intensieve begeleiding',
      features: [
        'Strategische coaching & projectbegeleiding',
        'Stakeholdermanagement',
        'Auditvoorbereiding en mock-audits',
        'Inrichting risicomanagement & incident logging',
        'Facilitatie van PDCA-cyclus',
        'Rapportage en communicatie'
      ],
      buttonText: 'Kies Pakket',
      buttonVariant: 'outline' as const,
      popular: false
    },
    {
      title: 'Maatwerk',
      price: 'Op aanvraag',
      duration: 'In overleg',
      maturityLevel: 'Flexibel',
      description: 'Een volledig op maat gemaakte BCM-oplossing voor complexe of vitale organisaties',
      targetAudience: 'Enterprise, Zorgketens, Overheid',
      features: [
        'Ketenbrede risicoaanpak',
        'Gecombineerde BCM/ITDR/crisismanagement strategieën',
        'BCM integreren met NIS2/BIO',
        'Boardroom crisissimulaties',
        'Integratie in bestaande GRC-architectuur'
      ],
      buttonText: 'Neem Contact Op',
      buttonVariant: 'default' as const,
      popular: false
    }
  ]

  return (
    <section className="py-20 bg-background rounded-lg mx-4 md:mx-6 my-6">
      <div className="container">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            BCM-aanbod: ISO 22301 Trajecten
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
            Onze vier pakketten zijn ontworpen om organisaties te helpen bij het opzetten, implementeren en optimaliseren van hun Business Continuity Management System (BCMS), conform ISO 22301.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pricingPackages.map((pkg, index) => (
            <Card key={index} className={`card-hover relative ${pkg.popular ? 'border-primary shadow-lg' : ''}`}>
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Populair</Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg mb-2">{pkg.title}</CardTitle>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-primary">{pkg.price}</div>
                  <div className="text-sm text-muted-foreground">{pkg.duration}</div>
                  <Badge variant="secondary" className="text-xs">{pkg.maturityLevel}</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <CardDescription className="text-sm text-center">
                  {pkg.description}
                </CardDescription>

                {pkg.targetAudience && (
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Voor:</p>
                    <p className="text-sm text-muted-foreground">{pkg.targetAudience}</p>
                  </div>
                )}

                <div className="space-y-2">
                  {pkg.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  asChild 
                  className="w-full mt-6" 
                  variant={pkg.buttonVariant}
                  size="sm"
                >
                  <Link href={pkg.buttonText === 'Neem Contact Op' ? '/adviesgesprek' : '/adviesgesprek'}>
                    {pkg.buttonText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Alle prijzen zijn exclusief BTW. Pakketinhoud kan worden aangepast aan uw specifieke behoeften.
          </p>
        </div>
      </div>
    </section>
  )
}

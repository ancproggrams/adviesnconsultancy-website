


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Bot, Clock } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'IT Consultancy Diensten - Business Continuiteit & Compliance',
  description: 'Professionele IT-consultancy diensten: ISO 22301 compliance, business continuiteit, AI outsourcing en cybersecurity oplossingen.',
}

export default function DienstenPage() {
  const services = [
    {
      icon: Shield,
      title: 'ISO 22301 Compliance',
      description: 'Volledige implementatie en onderhoud van business continuiteit managementsystemen volgens internationale standaarden.',
      features: ['Gap-analyse', 'BCMS implementatie', 'Audit voorbereiding', 'Continue ondersteuning']
    },
    {
      icon: Bot,
      title: 'AI Outsourcing',
      description: 'Automatiseer uw bedrijfsprocessen met AI en machine learning oplossingen op maat.',
      features: ['Proces automatisering', 'AI implementatie', 'Training & ondersteuning', 'Continue optimalisatie']
    },
    {
      icon: Clock,
      title: 'Business Continuity Planning',
      description: 'Ontwikkeling van strategieën om bedrijfskritische processen te beschermen tegen verstoringen.',
      features: ['BIA uitvoering', 'Recovery strategieën', 'Crisis management', 'Continuiteitsplannen']
    }
  ]

  return (
    <div className="min-h-screen py-12">
      <div className="container">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            IT Consultancy Diensten
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Professionele IT-consultancy diensten om uw bedrijf te helpen groeien, voldoen aan compliance eisen en de digitale transformatie succesvol door te lopen.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => (
            <Card key={index} className="card-hover h-full">
              <CardHeader>
                <div className="mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  <service.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-primary rounded-full"></div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center space-y-8 bg-muted/50 rounded-lg p-12">
          <h2 className="text-3xl font-bold text-foreground">
            Klaar om te starten?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ontdek hoe onze expertise uw bedrijf kan transformeren en voldoen aan alle compliance eisen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="btn-primary">
              <Link href="/compliance-automation#quickscan">
                Start Quick Scan
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/adviesgesprek">
                Plan Gesprek
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

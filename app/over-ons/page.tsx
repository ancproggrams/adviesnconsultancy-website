


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Award, Users, Target, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Over Ons - Advies N Consultancy BV',
  description: 'Leer meer over Advies N Consultancy BV, uw partner in IT-consultancy, business continuiteit en compliance oplossingen in Nederland.',
}

export default function OverOnsPage() {
  const values = [
    {
      icon: Award,
      title: 'Expertise',
      description: 'Diepgaande kennis van ISO 22301, business continuiteit en IT-infrastructuur.'
    },
    {
      icon: Users,
      title: 'Partnership',
      description: 'Wij werken als strategische partner met onze klanten voor duurzame resultaten.'
    },
    {
      icon: Target,
      title: 'Resultaatgericht',
      description: 'Focus op meetbare resultaten en continue verbetering van uw processen.'
    },
    {
      icon: TrendingUp,
      title: 'Innovatie',
      description: 'Gebruik van de nieuwste technologieën en best practices in de industrie.'
    }
  ]

  return (
    <div className="min-h-screen py-12">
      <div className="container">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Over Advies N Consultancy BV
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Uw strategische partner in business continuiteit, compliance en IT-transformatie. 
            Wij helpen organisaties hun bedrijfskritische processen te beschermen en optimaliseren.
          </p>
        </div>

        {/* Company Story */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Ons Verhaal</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Advies N Consultancy BV is ontstaan vanuit de behoefte om organisaties te helpen 
                bij het navigeren door de complexe wereld van business continuiteit en compliance. 
                Met meer dan 15 jaar ervaring in IT-consultancy hebben wij ons gespecialiseerd in 
                het implementeren van robuuste systemen die bedrijven beschermen tegen onverwachte verstoringen.
              </p>
              <p>
                Ons team bestaat uit gecertificeerde experts die een diepgaande kennis hebben van 
                internationale standaarden zoals ISO 22301. Wij geloven in een praktische benadering 
                waarbij theorie wordt omgezet in werkbare oplossingen die direct waarde toevoegen aan uw organisatie.
              </p>
              <p>
                Vanuit ons kantoor in Voorburg bedienen wij klanten door heel Nederland en daarbuiten. 
                Van kleine MKB-bedrijven tot grote enterprises, wij passen onze aanpak aan op de 
                specifieke behoeften en uitdagingen van elke organisatie.
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] relative bg-muted rounded-lg overflow-hidden">
              <Image
                src="/landscape-hero-bg.jpg"
                alt="Advies N Consultancy kantoor"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold text-foreground">Onze Waarden</h2>
            <p className="text-xl text-muted-foreground">
              De principes die ons dagelijks werk vormgeven
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center card-hover">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {value.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold text-foreground">Ons Team</h2>
            <p className="text-xl text-muted-foreground">
              Ervaren professionals die uw succes centraal stellen
            </p>
          </div>
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <CardTitle>Marc René</CardTitle>
              <CardDescription>Founder & Lead Consultant</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                ISO 22301 Lead Auditor met meer dan 15 jaar ervaring in business continuity 
                management en IT-consultancy. Gespecialiseerd in het implementeren van 
                compliance frameworks voor middelgrote tot grote organisaties.
              </p>
              <div className="space-y-1 text-sm">
                <p><strong>Certificeringen:</strong> ISO 22301 Lead Auditor, CISSP, PMP</p>
                <p><strong>Expertise:</strong> Business Continuity, ISO Standards, IT Governance</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-8 bg-muted/50 rounded-lg p-12">
          <h2 className="text-3xl font-bold text-foreground">
            Klaar om samen te werken?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Laten we een gesprek plannen om te bespreken hoe wij uw organisatie kunnen helpen 
            met business continuiteit en compliance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="btn-primary">
              <Link href="/adviesgesprek">
                Plan een Gesprek
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/compliance-automation#quickscan">
                Start Quick Scan
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

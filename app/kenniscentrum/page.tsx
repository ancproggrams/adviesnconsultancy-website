


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Download, FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Kenniscentrum - IT & Compliance Resources',
  description: 'Toegang tot waardevolle resources, whitepapers, case studies en best practices voor business continuiteit en compliance.',
}

export default function KenniscentrumPage() {
  // TODO: Replace with real articles from CMS
  const featuredArticles: any[] = []

  // TODO: Replace with real resources from CMS
  const resources: any[] = []

  // TODO: Replace with real case studies from CMS
  const caseStudies: any[] = []

  return (
    <div className="min-h-screen py-12">
      <div className="container">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Kenniscentrum
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Ontdek waardevolle inzichten, best practices en praktische resources voor 
            business continuiteit, compliance en IT-transformatie.
          </p>
        </div>

        {/* Featured Articles */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">Uitgelichte Artikelen</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/kenniscentrum/artikelen">
                Bekijk Alle Artikelen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          {featuredArticles.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="space-y-4">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Nog geen artikelen beschikbaar</h3>
                  <p className="text-muted-foreground">
                    Wij werken aan het toevoegen van waardevolle content. Kom binnenkort terug voor de nieuwste inzichten over business continuiteit en compliance.
                  </p>
                </div>
                <Button asChild variant="outline">
                  <Link href="/adviesgesprek">
                    Stel een vraag aan onze experts
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Articles will be rendered here when available */}
            </div>
          )}
        </div>

        {/* Downloads & Templates */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">Downloads & Templates</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/kenniscentrum/downloads">
                Alle Resources
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          {resources.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="space-y-4">
                <Download className="h-12 w-12 text-muted-foreground mx-auto" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Downloads komen binnenkort beschikbaar</h3>
                  <p className="text-muted-foreground">
                    Wij werken aan het samenstellen van praktische templates en checklists voor ISO 22301 compliance en business continuiteit.
                  </p>
                </div>
                <Button asChild variant="outline">
                  <Link href="/compliance-automation#quickscan">
                    Start Quick Scan
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Resources will be rendered here when available */}
            </div>
          )}
        </div>

        {/* Case Studies */}
        <div className="mb-16">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold text-foreground">Case Studies</h2>
            <p className="text-xl text-muted-foreground">
              Ontdek hoe wij organisaties hebben geholpen hun doelen te bereiken
            </p>
          </div>
          
          {caseStudies.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="space-y-4">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Case studies worden voorbereid</h3>
                  <p className="text-muted-foreground">
                    Wij documenteren momenteel onze succesverhalen om deze binnenkort met u te delen. Neem contact op voor referenties.
                  </p>
                </div>
                <Button asChild variant="outline">
                  <Link href="/adviesgesprek">
                    Vraag naar referenties
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Case studies will be rendered here when available */}
            </div>
          )}
        </div>

        {/* Newsletter Signup */}
        <div className="bg-primary text-primary-foreground rounded-lg p-12 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">Blijf op de hoogte</h2>
            <p className="text-lg opacity-90">
              Ontvang maandelijks de nieuwste inzichten, tips en resources over 
              business continuiteit en compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Uw e-mailadres"
                className="flex-1 px-4 py-2 rounded-md text-foreground"
              />
              <Button variant="secondary">
                Aanmelden
              </Button>
            </div>
            <p className="text-sm opacity-75">
              Geen spam, altijd uitschrijfbaar. Zie onze privacy policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

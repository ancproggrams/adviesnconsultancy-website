
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Target, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export function ReadinessAssessmentSection() {
  return (
    <section className="py-20 section-background rounded-lg mx-4 md:mx-6 my-6">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Ontdek Uw Compliance Readiness
            </h2>
            <p className="text-xl text-muted-foreground">
              Krijg in 5 minuten inzicht in uw organisatie's volwassenheid op het gebied van business continuïteit en compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="card-hover">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-lg">Gerichte Analyse</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  27 strategische vragen die alle aspecten van uw bedrijfscontinuïteit belichten.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-lg">Volwassenheidscore</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Ontvang een gedetailleerde score per categorie en een overzicht van verbeterpunten.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-lg">Persoonlijke Aanbevelingen</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Krijg direct actionable aanbevelingen om uw compliance niveau te verhogen.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Button asChild size="lg" className="btn-primary text-lg px-8 py-6">
              <Link href="/compliance-automation#quickscan">
                Start Gratis Quick Scan
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              Geen verplichtingen • Resultaten direct beschikbaar • 100% vertrouwelijk
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

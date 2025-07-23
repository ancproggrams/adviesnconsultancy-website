

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Calendar } from 'lucide-react'

export function CTASection() {
  return (
    <section className="py-20 section-background rounded-lg mx-4 md:mx-6 my-6">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Klaar om uw IT-infrastructuur te transformeren?
            </h2>
            <p className="text-xl text-muted-foreground">
              Ontdek hoe onze expertise uw bedrijf kan helpen groeien en voldoen aan alle compliance eisen.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="btn-primary text-lg px-8 py-6">
              <Link href="/compliance-automation#quickscan">
                Start Quick Scan
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6">
              <Link href="/adviesgesprek">
                <Calendar className="mr-2 h-5 w-5" />
                Plan Demo
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">5 min</div>
              <div className="text-muted-foreground">Quick Scan</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">Gratis</div>
              <div className="text-muted-foreground">Eerste Consultatie</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">Direct</div>
              <div className="text-muted-foreground">Resultaten</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

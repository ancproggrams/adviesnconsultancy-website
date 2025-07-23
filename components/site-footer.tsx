

import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="relative h-8 w-8">
                <Image
                  src="/ANCLOGO.jpeg"
                  alt="Advies N Consultancy BV Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-semibold text-foreground">Advies N Consultancy BV</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Professionele IT-consultancy en compliance experts
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>info@adviesnconsultancy.nl</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+31 6 22675520</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Voorburg, Nederland</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Diensten</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/diensten" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors focus-visible"
                >
                  IT Consultancy
                </Link>
              </li>
              <li>
                <Link 
                  href="/compliance-automation" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors focus-visible"
                >
                  Compliance Automation
                </Link>
              </li>
              <li>
                <Link 
                  href="/diensten" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors focus-visible"
                >
                  AI Outsourcing
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Over ons</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/over-ons" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors focus-visible"
                >
                  Over Ons
                </Link>
              </li>
              <li>
                <Link 
                  href="/adviesgesprek" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors focus-visible"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Tools</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/compliance-automation#quickscan" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors focus-visible"
                >
                  Quick Scan
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2024 Advies N Consultancy BV. Alle rechten voorbehouden.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

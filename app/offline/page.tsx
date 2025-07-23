'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WifiOff, Home, Phone, Mail, MapPin } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <WifiOff className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-foreground mb-4">
              You're Offline
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              It looks like you've lost your internet connection. 
              Don't worry, you can still access some information below.
            </p>
          </div>

          {/* Offline Content */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  Get in touch with us directly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-left">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>info@adviesnconsultancy.nl</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>+31 (0)70 123 4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Voorburg, Nederland</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Our Services</CardTitle>
                <CardDescription>
                  Professional IT consultancy services
                </CardDescription>
              </CardHeader>
              <CardContent className="text-left">
                <ul className="space-y-2">
                  <li>• IT Consultancy</li>
                  <li>• Business Continuity</li>
                  <li>• Compliance Automation</li>
                  <li>• AI Outsourcing</li>
                  <li>• Digital Transformation</li>
                  <li>• Cybersecurity</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={() => window.location.reload()} 
              className="btn-primary"
            >
              Try Again
            </Button>
            
            <div className="text-sm text-muted-foreground">
              <Button asChild variant="link">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Return to Homepage
                </Link>
              </Button>
            </div>
          </div>

          {/* Cached Pages */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Available Offline</CardTitle>
              <CardDescription>
                These pages might be available in your cache
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/">Home</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/diensten">Services</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/over-ons">About Us</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/compliance-automation">Compliance</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/adviesgesprek">Consultation</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

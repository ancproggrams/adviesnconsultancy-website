


'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, CheckCircle, Phone, Mail, Building, ExternalLink } from 'lucide-react'

export default function AdviesgespreksPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    interest: '',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          formType: 'consultation'
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        alert('Er is iets misgegaan. Probeer het opnieuw.')
      }
    } catch (error) {
      alert('Er is iets misgegaan. Probeer het opnieuw.')
    }
  }

  const benefits = [
    {
      icon: CheckCircle,
      title: 'Gratis Consultatie',
      description: 'Eerste adviesgesprek is volledig gratis en vrijblijvend'
    },
    {
      icon: Clock,
      title: 'Flexibele Planning',
      description: 'Wij plannen het gesprek op een tijdstip dat u uitkomt'
    },
    {
      icon: Calendar,
      title: 'Snelle Response',
      description: 'Binnen 24 uur nemen wij contact met u op'
    }
  ]

  if (isSubmitted) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="container max-w-2xl text-center space-y-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-foreground">Bedankt voor uw aanvraag!</h1>
            <p className="text-xl text-muted-foreground">
              Wij hebben uw verzoek ontvangen en nemen binnen 24 uur contact met u op 
              om een geschikt tijdstip voor het adviesgesprek in te plannen.
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-6 space-y-2">
            <h3 className="font-semibold">Wat gebeurt er nu?</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Wij beoordelen uw aanvraag</li>
              <li>• Een van onze consultants neemt contact met u op</li>
              <li>• Samen plannen wij een geschikt tijdstip voor het gesprek</li>
              <li>• Het gesprek kan telefonisch, online of op locatie plaatsvinden</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-4xl">
        <div className="text-center space-y-6 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Plan een Adviesgesprek
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Ontdek hoe wij uw organisatie kunnen helpen met business continuiteit, 
            compliance en IT-transformatie. Het eerste gesprek is altijd gratis en vrijblijvend.
          </p>
        </div>

        {/* Direct Booking CTA */}
        <div className="bg-primary text-primary-foreground rounded-lg p-8 mb-12 text-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Direct online inplannen?</h2>
            <p className="text-lg opacity-90">
              Plan direct een afspraak in onze agenda voor een persoonlijk adviesgesprek.
            </p>
            <Button 
              asChild 
              size="lg" 
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90"
            >
              <a 
                href="https://outlook.office.com/bookwithme/user/d7de4a87e4164eed9a6ab6612a0cbc1a@adviesnconsultancy.nl?anonymous&ismsaljsauthenabled&ep=plink"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Plan Direct Online
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Aanvraagformulier</CardTitle>
              <CardDescription>
                Vul uw gegevens in en wij nemen zo snel mogelijk contact met u op.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Naam *</Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Uw volledige naam"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="uw.email@bedrijf.nl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Bedrijf</Label>
                    <Input
                      id="company"
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Uw bedrijfsnaam"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefoon</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+31 6 12345678"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interest">Interesse *</Label>
                  <Select value={formData.interest} onValueChange={(value) => setFormData({ ...formData, interest: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer uw interesse" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iso22301">ISO 22301 Compliance</SelectItem>
                      <SelectItem value="business-continuity">Business Continuity Planning</SelectItem>
                      <SelectItem value="ai-outsourcing">AI Outsourcing</SelectItem>
                      <SelectItem value="compliance-automation">Compliance Automation Platform</SelectItem>
                      <SelectItem value="other">Overig</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Bericht</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Vertel ons meer over uw uitdaging of vraag..."
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full btn-primary">
                  Verstuur Aanvraag
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Benefits & Contact Info */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Waarom een adviesgesprek?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <benefit.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Informatie</CardTitle>
                <CardDescription>
                  Heeft u vragen? Neem direct contact met ons op.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <span>info@adviesnconsultancy.nl</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <span>+31 6 22675520</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <span>Voorburg, Nederland</span>
                </div>
              </CardContent>
            </Card>

            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold">Direct starten?</h3>
              <p className="text-sm text-muted-foreground">
                Wilt u alvast een beeld krijgen van uw huidige compliance status? 
                Start dan onze gratis Quick Scan.
              </p>
              <Button asChild variant="outline" className="w-full">
                <a href="/compliance-automation#quickscan">
                  Start Quick Scan
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

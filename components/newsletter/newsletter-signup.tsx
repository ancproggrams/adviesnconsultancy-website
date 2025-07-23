
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Check, AlertCircle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface NewsletterSignupProps {
  source?: string
  className?: string
  variant?: 'default' | 'compact' | 'minimal'
  showPreferences?: boolean
}

export function NewsletterSignup({ 
  source = 'website', 
  className = '', 
  variant = 'default',
  showPreferences = true 
}: NewsletterSignupProps) {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    company: '',
    preferences: ['IT-trends', 'Compliance']
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const preferences = [
    { id: 'IT-trends', label: 'IT Trends & Innovaties', description: 'Laatste ontwikkelingen in IT' },
    { id: 'Compliance', label: 'Compliance & Regelgeving', description: 'AVG, NIS2, ISO updates' },
    { id: 'AI-insights', label: 'AI & Automatisering', description: 'Praktische AI toepassingen' },
    { id: 'Case-studies', label: 'Case Studies', description: 'Real-world implementaties' },
    { id: 'Business-continuity', label: 'Business Continuity', description: 'BCP strategieën & tips' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email) {
      toast.error('Email adres is verplicht')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source
        })
      })

      const result = await response.json()

      if (result.success) {
        setIsSubscribed(true)
        toast.success('Succesvol ingeschreven! Check je email voor een bevestiging.')
        
        // Track in analytics
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'newsletter_signup', {
            event_category: 'engagement',
            event_label: source,
            value: 1
          })
        }
      } else {
        toast.error(result.error || 'Er is een fout opgetreden')
      }
    } catch (error) {
      console.error('Newsletter signup error:', error)
      toast.error('Er is een fout opgetreden. Probeer het later opnieuw.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreferenceChange = (preference: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        preferences: [...prev.preferences, preference]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        preferences: prev.preferences.filter(p => p !== preference)
      }))
    }
  }

  if (isSubscribed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${className}`}
      >
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800">Welkom bij onze newsletter!</h3>
                <p className="text-green-700 mt-1">
                  Je ontvangt binnenkort een bevestigingsmail met je eerste IT expertise update.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (variant === 'minimal') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${className}`}
      >
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="Jouw email adres"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
          </Button>
        </form>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${className}`}
    >
      <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-xl text-blue-900">
            IT Expertise Newsletter
          </CardTitle>
          <p className="text-blue-700 mt-2">
            Maandelijkse inzichten over IT trends, compliance en business continuity
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email adres *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="naam@bedrijf.nl"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={isLoading}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Naam
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jouw naam"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-medium">
                Bedrijf
              </Label>
              <Input
                id="company"
                type="text"
                placeholder="Jouw bedrijf"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                disabled={isLoading}
              />
            </div>

            {showPreferences && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Interesses (selecteer wat je interesseert)
                </Label>
                <div className="grid grid-cols-1 gap-3">
                  {preferences.map((preference) => (
                    <div key={preference.id} className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                      <Checkbox
                        id={preference.id}
                        checked={formData.preferences.includes(preference.id)}
                        onCheckedChange={(checked) => 
                          handlePreferenceChange(preference.id, checked === true)
                        }
                        disabled={isLoading}
                      />
                      <div className="flex-1">
                        <Label 
                          htmlFor={preference.id} 
                          className="text-sm font-medium cursor-pointer"
                        >
                          {preference.label}
                        </Label>
                        <p className="text-xs text-gray-600 mt-1">
                          {preference.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Bezig met inschrijven...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Inschrijven voor newsletter
                </div>
              )}
            </Button>

            <div className="flex items-start gap-2 text-xs text-gray-600">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                We respecteren je privacy. Je kunt je op elk moment uitschrijven. 
                Lees onze <a href="/privacy" className="text-blue-600 hover:underline">privacyverklaring</a>.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

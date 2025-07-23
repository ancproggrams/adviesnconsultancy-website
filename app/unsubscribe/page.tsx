
'use client'

import { useState, useEffect, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Check, AlertCircle, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function UnsubscribeForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isUnsubscribed, setIsUnsubscribed] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Email adres is verplicht')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const result = await response.json()

      if (result.success) {
        setIsUnsubscribed(true)
        toast.success('Je bent succesvol uitgeschreven van onze newsletter')
      } else {
        toast.error(result.error || 'Er is een fout opgetreden')
      }
    } catch (error) {
      console.error('Unsubscribe error:', error)
      toast.error('Er is een fout opgetreden. Probeer het later opnieuw.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Link href="/" className="inline-block mb-6">
            <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug naar homepage
            </Button>
          </Link>

          {!isUnsubscribed ? (
            <Card className="bg-white shadow-xl border-0">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">
                  Uitschrijven Newsletter
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  We vinden het jammer dat je onze newsletter wilt verlaten. 
                  Vul je email adres in om je uit te schrijven.
                </p>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleUnsubscribe} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email adres
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="naam@bedrijf.nl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      required
                      className="w-full"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Bezig met uitschrijven...
                      </div>
                    ) : (
                      'Uitschrijven'
                    )}
                  </Button>

                  <div className="flex items-start gap-2 text-xs text-gray-600">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>
                      Na het uitschrijven ontvang je geen nieuwsbrieven meer van ons. 
                      Je kunt je altijd opnieuw inschrijven op onze website.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white shadow-xl border-0">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Succesvol Uitgeschreven
                      </h3>
                      <p className="text-gray-600 mt-2">
                        Je bent uitgeschreven van onze newsletter. 
                        We hopen je in de toekomst weer te mogen verwelkomen!
                      </p>
                    </div>
                    
                    <div className="space-y-3 pt-4">
                      <Link href="/" className="block">
                        <Button variant="outline" className="w-full">
                          Terug naar Homepage
                        </Button>
                      </Link>
                      <Link href="/kenniscentrum" className="block">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          Bezoek ons Kenniscentrum
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="bg-white shadow-xl border-0">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-gray-600">Loading...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <UnsubscribeForm />
    </Suspense>
  )
}

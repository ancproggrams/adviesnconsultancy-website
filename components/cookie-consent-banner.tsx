
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Cookie, Settings, Shield, BarChart3, Target, Palette, X, Check } from 'lucide-react'
import cookieConsent, { CookieConsentSettings, CookieCategory } from '@/lib/cookie-consent'
import { useToast } from '@/hooks/use-toast'

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<Partial<CookieConsentSettings>>({
    analytics: false,
    marketing: false,
    preferences: true
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const { toast } = useToast()

  // Set client-side flag to prevent SSR hydration errors
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const handleShowConsent = () => {
      setShowBanner(true)
    }

    window.addEventListener('showCookieConsent', handleShowConsent)
    
    // Check if consent is needed
    if (cookieConsent.isConsentRequired()) {
      setShowBanner(true)
    }

    return () => {
      window.removeEventListener('showCookieConsent', handleShowConsent)
    }
  }, [isClient])

  const handleAcceptAll = async () => {
    setIsLoading(true)
    try {
      cookieConsent.acceptAll()
      setShowBanner(false)
      toast({
        title: 'Cookie voorkeuren opgeslagen',
        description: 'Alle cookies zijn geaccepteerd.',
      })
    } catch (error) {
      toast({
        title: 'Fout bij opslaan',
        description: 'Er ging iets mis bij het opslaan van uw voorkeuren.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRejectAll = async () => {
    setIsLoading(true)
    try {
      cookieConsent.rejectAll()
      setShowBanner(false)
      toast({
        title: 'Cookie voorkeuren opgeslagen',
        description: 'Alleen noodzakelijke cookies zijn geaccepteerd.',
      })
    } catch (error) {
      toast({
        title: 'Fout bij opslaan',
        description: 'Er ging iets mis bij het opslaan van uw voorkeuren.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      cookieConsent.setConsent(settings)
      setShowBanner(false)
      setShowSettings(false)
      toast({
        title: 'Cookie voorkeuren opgeslagen',
        description: 'Uw aangepaste voorkeuren zijn opgeslagen.',
      })
    } catch (error) {
      toast({
        title: 'Fout bij opslaan',
        description: 'Er ging iets mis bij het opslaan van uw voorkeuren.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const cookieInfo = cookieConsent.getCookieInfo()

  if (!isClient || !showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-background/95 to-background/80 backdrop-blur-sm border-t">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Cookie className="h-5 w-5 text-primary" />
            <span>Cookie Voorkeuren</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We gebruiken cookies om uw ervaring te verbeteren, website verkeer te analyseren, en content te personaliseren. 
            Door op "Accepteer alle" te klikken, stemt u in met ons gebruik van cookies zoals beschreven in ons{' '}
            <a href="/privacy" className="text-primary hover:underline">
              privacybeleid
            </a>.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAcceptAll}
              disabled={isLoading}
              className="btn-primary flex-1"
            >
              <Check className="mr-2 h-4 w-4" />
              Accepteer alle
            </Button>
            <Button
              onClick={handleRejectAll}
              disabled={isLoading}
              variant="outline"
              className="flex-1"
            >
              <X className="mr-2 h-4 w-4" />
              Alleen noodzakelijke
            </Button>
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <Settings className="mr-2 h-4 w-4" />
                  Instellingen
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Cookie Instellingen</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[600px] pr-4">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-5 w-5 text-green-600" />
                          <Label htmlFor="necessary" className="font-medium">
                            Noodzakelijke cookies
                          </Label>
                          <Badge variant="secondary">Verplicht</Badge>
                        </div>
                        <Switch
                          id="necessary"
                          checked={true}
                          disabled={true}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground ml-7">
                        Deze cookies zijn essentieel voor het functioneren van de website en kunnen niet worden uitgeschakeld.
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="h-5 w-5 text-blue-600" />
                          <Label htmlFor="analytics" className="font-medium">
                            Analytische cookies
                          </Label>
                        </div>
                        <Switch
                          id="analytics"
                          checked={settings.analytics}
                          onCheckedChange={(checked) => 
                            setSettings(prev => ({ ...prev, analytics: checked }))
                          }
                        />
                      </div>
                      <p className="text-sm text-muted-foreground ml-7">
                        Deze cookies helpen ons te begrijpen hoe bezoekers de website gebruiken door anoniem informatie te verzamelen.
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Target className="h-5 w-5 text-orange-600" />
                          <Label htmlFor="marketing" className="font-medium">
                            Marketing cookies
                          </Label>
                        </div>
                        <Switch
                          id="marketing"
                          checked={settings.marketing}
                          onCheckedChange={(checked) => 
                            setSettings(prev => ({ ...prev, marketing: checked }))
                          }
                        />
                      </div>
                      <p className="text-sm text-muted-foreground ml-7">
                        Deze cookies worden gebruikt om advertenties relevant voor u te maken en uw interesses te volgen.
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Palette className="h-5 w-5 text-purple-600" />
                          <Label htmlFor="preferences" className="font-medium">
                            Voorkeuren cookies
                          </Label>
                        </div>
                        <Switch
                          id="preferences"
                          checked={settings.preferences}
                          onCheckedChange={(checked) => 
                            setSettings(prev => ({ ...prev, preferences: checked }))
                          }
                        />
                      </div>
                      <p className="text-sm text-muted-foreground ml-7">
                        Deze cookies onthouden uw voorkeuren zoals taal en thema om uw ervaring te personaliseren.
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium">Gedetailleerde Cookie Informatie</h4>
                      <div className="space-y-3">
                        {cookieInfo.map((cookie, index) => (
                          <div key={index} className="p-3 bg-muted rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-sm">{cookie.name}</h5>
                              <Badge variant="outline" className="text-xs">
                                {cookie.category}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">
                              {cookie.purpose}
                            </p>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Verloopt: {cookie.expiry}</span>
                              <span>Door: {cookie.provider}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    onClick={() => setShowSettings(false)}
                    variant="outline"
                    disabled={isLoading}
                  >
                    Annuleren
                  </Button>
                  <Button
                    onClick={handleSaveSettings}
                    disabled={isLoading}
                    className="btn-primary"
                  >
                    {isLoading ? 'Opslaan...' : 'Voorkeuren opslaan'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

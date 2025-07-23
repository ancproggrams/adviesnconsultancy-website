
'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MessageSquare, 
  Settings, 
  Save, 
  BarChart3, 
  Users,
  Clock,
  Loader2
} from 'lucide-react'

type ChatbotConfig = {
  id: string
  name: string
  welcomeMessage: string
  fallbackMessage: string
  leadQualificationEnabled: boolean
  autoResponseEnabled: boolean
  businessHours: any
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function ChatbotConfigPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [config, setConfig] = useState<ChatbotConfig | null>(null)

  const [formData, setFormData] = useState({
    name: 'ANC Chatbot',
    welcomeMessage: 'Hallo! Ik ben de AI-assistent van Advies N Consultancy BV. Hoe kan ik u helpen met vragen over business continuity management?',
    fallbackMessage: 'Excuses, ik begrijp uw vraag niet helemaal. Kunt u het anders formuleren of contact opnemen met onze experts?',
    leadQualificationEnabled: true,
    autoResponseEnabled: true,
    isActive: true,
    businessHours: {
      monday: { enabled: true, start: '09:00', end: '17:00' },
      tuesday: { enabled: true, start: '09:00', end: '17:00' },
      wednesday: { enabled: true, start: '09:00', end: '17:00' },
      thursday: { enabled: true, start: '09:00', end: '17:00' },
      friday: { enabled: true, start: '09:00', end: '17:00' },
      saturday: { enabled: false, start: '09:00', end: '17:00' },
      sunday: { enabled: false, start: '09:00', end: '17:00' }
    } as Record<string, { enabled: boolean; start: string; end: string }>
  })

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      setIsLoadingData(true)
      const response = await fetch('/api/chatbot/config')
      
      if (response.ok) {
        const data = await response.json()
        if (data.config) {
          setConfig(data.config)
          setFormData({
            name: data.config.name || 'ANC Chatbot',
            welcomeMessage: data.config.welcomeMessage || formData.welcomeMessage,
            fallbackMessage: data.config.fallbackMessage || formData.fallbackMessage,
            leadQualificationEnabled: data.config.leadQualificationEnabled ?? true,
            autoResponseEnabled: data.config.autoResponseEnabled ?? true,
            isActive: data.config.isActive ?? true,
            businessHours: data.config.businessHours || formData.businessHours
          })
        }
      }
    } catch (error) {
      console.error('Error fetching chatbot config:', error)
      // Use default values if config doesn't exist
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleBusinessHoursChange = (day: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...(prev.businessHours as Record<string, { enabled: boolean; start: string; end: string }>)[day],
          [field]: value
        }
      }
    }))
  }

  const handleSubmit = async () => {
    setError('')
    setSuccess('')

    try {
      setIsLoading(true)

      const response = await fetch('/api/chatbot/config', {
        method: config ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save chatbot config')
      }

      const data = await response.json()
      setConfig(data.config)
      setSuccess('Chatbot configuratie succesvol opgeslagen!')

    } catch (error) {
      console.error('Error saving chatbot config:', error)
      setError('Fout bij het opslaan van chatbot configuratie')
    } finally {
      setIsLoading(false)
    }
  }

  const days = [
    { key: 'monday', label: 'Maandag' },
    { key: 'tuesday', label: 'Dinsdag' },
    { key: 'wednesday', label: 'Woensdag' },
    { key: 'thursday', label: 'Donderdag' },
    { key: 'friday', label: 'Vrijdag' },
    { key: 'saturday', label: 'Zaterdag' },
    { key: 'sunday', label: 'Zondag' }
  ]

  if (isLoadingData) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Chatbot configuratie laden...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Chatbot Configuratie</h1>
        <p className="text-muted-foreground">
          Beheer de instellingen en gedrag van de AI chatbot
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="text-2xl font-bold">{formData.isActive ? 'Actief' : 'Inactief'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Lead Qualification</p>
                <p className="text-2xl font-bold">{formData.leadQualificationEnabled ? 'Aan' : 'Uit'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Auto Response</p>
                <p className="text-2xl font-bold">{formData.autoResponseEnabled ? 'Aan' : 'Uit'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Business Hours</p>
                <p className="text-2xl font-bold">
                  {Object.values(formData.businessHours as Record<string, { enabled: boolean; start: string; end: string }>).filter((day) => day.enabled).length}/7
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">Algemene Instellingen</TabsTrigger>
          <TabsTrigger value="messages">Berichten</TabsTrigger>
          <TabsTrigger value="hours">Openingstijden</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Algemene Configuratie</CardTitle>
              <CardDescription>
                Basis instellingen voor de chatbot functionaliteit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Chatbot Naam</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Naam van de chatbot"
                  className="mt-1"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Chatbot Actief</Label>
                  <p className="text-sm text-muted-foreground">
                    Zet de chatbot aan of uit voor bezoekers
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="leadQualificationEnabled">Lead Kwalificatie</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatisch leads kwalificeren op basis van gesprekken
                  </p>
                </div>
                <Switch
                  id="leadQualificationEnabled"
                  checked={formData.leadQualificationEnabled}
                  onCheckedChange={(checked) => handleInputChange('leadQualificationEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoResponseEnabled">Automatische Reacties</Label>
                  <p className="text-sm text-muted-foreground">
                    Schakel automatische AI-reacties in of uit
                  </p>
                </div>
                <Switch
                  id="autoResponseEnabled"
                  checked={formData.autoResponseEnabled}
                  onCheckedChange={(checked) => handleInputChange('autoResponseEnabled', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Chatbot Berichten</CardTitle>
              <CardDescription>
                Configureer de standaard berichten van de chatbot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="welcomeMessage">Welkomstbericht</Label>
                <Textarea
                  id="welcomeMessage"
                  value={formData.welcomeMessage}
                  onChange={(e) => handleInputChange('welcomeMessage', e.target.value)}
                  placeholder="Bericht dat getoond wordt wanneer de chat wordt gestart"
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="fallbackMessage">Fallback Bericht</Label>
                <Textarea
                  id="fallbackMessage"
                  value={formData.fallbackMessage}
                  onChange={(e) => handleInputChange('fallbackMessage', e.target.value)}
                  placeholder="Bericht dat getoond wordt wanneer de chatbot de vraag niet begrijpt"
                  rows={3}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Openingstijden</CardTitle>
              <CardDescription>
                Stel in wanneer de chatbot actief is voor automatische reacties
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {days.map((day) => {
                const businessHours = formData.businessHours as Record<string, { enabled: boolean; start: string; end: string }>
                return (
                  <div key={day.key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Switch
                        checked={businessHours[day.key]?.enabled || false}
                        onCheckedChange={(checked) => handleBusinessHoursChange(day.key, 'enabled', checked)}
                      />
                      <Label className="w-20">{day.label}</Label>
                    </div>
                    
                    {businessHours[day.key]?.enabled && (
                      <div className="flex items-center space-x-2">
                        <Input
                          type="time"
                          value={businessHours[day.key]?.start || '09:00'}
                          onChange={(e) => handleBusinessHoursChange(day.key, 'start', e.target.value)}
                          className="w-24"
                        />
                        <span className="text-muted-foreground">tot</span>
                        <Input
                          type="time"
                          value={businessHours[day.key]?.end || '17:00'}
                          onChange={(e) => handleBusinessHoursChange(day.key, 'end', e.target.value)}
                          className="w-24"
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isLoading} className="min-w-32">
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? 'Opslaan...' : 'Instellingen Opslaan'}
        </Button>
      </div>
    </div>
  )
}


'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Save, Eye, Loader2 } from 'lucide-react'
import Link from 'next/link'

type CaseStudy = {
  id: string
  title: string
  industry: string
  challenge: string
  solution: string
  result: string
  duration: string
  imageUrl: string | null
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export default function EditCaseStudyPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    industry: '',
    challenge: '',
    solution: '',
    result: '',
    duration: '',
    imageUrl: '',
    status: 'DRAFT'
  })

  useEffect(() => {
    fetchCaseStudy()
  }, [params.id])

  const fetchCaseStudy = async () => {
    try {
      setIsLoadingData(true)
      const response = await fetch(`/api/case-studies/${params.id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Case study niet gevonden')
          return
        }
        throw new Error('Failed to fetch case study')
      }

      const data = await response.json()
      setCaseStudy(data.caseStudy)
      
      // Update form data
      setFormData({
        title: data.caseStudy.title || '',
        industry: data.caseStudy.industry || '',
        challenge: data.caseStudy.challenge || '',
        solution: data.caseStudy.solution || '',
        result: data.caseStudy.result || '',
        duration: data.caseStudy.duration || '',
        imageUrl: data.caseStudy.imageUrl || '',
        status: data.caseStudy.status || 'DRAFT'
      })
    } catch (error) {
      console.error('Error fetching case study:', error)
      setError('Fout bij het ophalen van case study')
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = () => {
    if (!formData.title?.trim()) {
      setError('Titel is verplicht')
      return false
    }
    if (!formData.industry?.trim()) {
      setError('Industrie is verplicht')
      return false
    }
    if (!formData.challenge?.trim()) {
      setError('Uitdaging is verplicht')
      return false
    }
    if (!formData.solution?.trim()) {
      setError('Oplossing is verplicht')
      return false
    }
    if (!formData.result?.trim()) {
      setError('Resultaat is verplicht')
      return false
    }
    if (!formData.duration?.trim()) {
      setError('Duur is verplicht')
      return false
    }
    return true
  }

  const handleSubmit = async (status?: string) => {
    setError('')
    setSuccess('')

    if (!validateForm()) {
      return
    }

    try {
      setIsLoading(true)

      const submissionData = {
        ...formData,
        status: status || formData.status
      }

      const response = await fetch(`/api/case-studies/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update case study')
      }

      const data = await response.json()
      setCaseStudy(data.caseStudy)
      setSuccess(`Case study succesvol bijgewerkt!`)

    } catch (error) {
      console.error('Error updating case study:', error)
      setError('Fout bij het bijwerken van case study')
    } finally {
      setIsLoading(false)
    }
  }

  const industries = [
    'Gezondheidszorg',
    'Financiële Dienstverlening',
    'Onderwijs',
    'Overheid',
    'Productie',
    'Retail',
    'Technologie',
    'Transport & Logistiek',
    'Energie & Utilities',
    'Bouw & Vastgoed',
    'Anders'
  ]

  if (isLoadingData) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Case study laden...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!caseStudy) {
    return (
      <div className="space-y-8">
        <Alert variant="destructive">
          <AlertDescription>Case study niet gevonden of fout bij het laden.</AlertDescription>
        </Alert>
        <Button asChild>
          <Link href="/admin/case-studies">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug naar Case Studies
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button asChild variant="outline">
            <Link href="/admin/case-studies">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Terug naar Case Studies
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Case Study Bewerken</h1>
            <p className="text-muted-foreground">
              Bewerk de details van "{caseStudy.title}"
            </p>
          </div>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Case Study Details</CardTitle>
              <CardDescription>
                Bewerk de basis informatie van de case study
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Voer de titel van je case study in"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="industry">Industrie *</Label>
                <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecteer een industrie" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Projectduur *</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="bijv. 6 maanden, 1 jaar, 3-6 maanden"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="imageUrl">Afbeelding URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  placeholder="https://img.freepik.com/premium-vector/hand-drawn-case-study-illustration_23-2149082707.jpg?size=626&ext=jpg"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>
                Bewerk de uitdaging, oplossing en resultaten
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="challenge">Uitdaging *</Label>
                <Textarea
                  id="challenge"
                  value={formData.challenge}
                  onChange={(e) => handleInputChange('challenge', e.target.value)}
                  placeholder="Beschrijf de business uitdaging waarmee de klant kwam..."
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="solution">Oplossing *</Label>
                <Textarea
                  id="solution"
                  value={formData.solution}
                  onChange={(e) => handleInputChange('solution', e.target.value)}
                  placeholder="Beschrijf de oplossing die is geïmplementeerd..."
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="result">Resultaat *</Label>
                <Textarea
                  id="result"
                  value={formData.result}
                  onChange={(e) => handleInputChange('result', e.target.value)}
                  placeholder="Beschrijf de behaalde resultaten en business impact..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publicatie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Concept</SelectItem>
                    <SelectItem value="PUBLISHED">Gepubliceerd</SelectItem>
                    <SelectItem value="ARCHIVED">Gearchiveerd</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={() => handleSubmit()} 
                  disabled={isLoading}
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? 'Opslaan...' : 'Wijzigingen Opslaan'}
                </Button>
                
                {formData.status === 'DRAFT' && (
                  <Button 
                    onClick={() => handleSubmit('PUBLISHED')} 
                    disabled={isLoading}
                    variant="outline"
                    className="w-full"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {isLoading ? 'Publiceren...' : 'Publiceren'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Case Study Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Aangemaakt:</strong> {new Date(caseStudy.createdAt).toLocaleDateString('nl-NL')}</p>
                <p><strong>Bijgewerkt:</strong> {new Date(caseStudy.updatedAt).toLocaleDateString('nl-NL')}</p>
                {caseStudy.publishedAt && (
                  <p><strong>Gepubliceerd:</strong> {new Date(caseStudy.publishedAt).toLocaleDateString('nl-NL')}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

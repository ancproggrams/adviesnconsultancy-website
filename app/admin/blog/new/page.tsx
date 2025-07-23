
'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import Link from 'next/link'

export default function NewBlogPostPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    status: 'DRAFT',
    metaTitle: '',
    metaDescription: '',
    keywords: ''
  })

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
    if (!formData.excerpt?.trim()) {
      setError('Samenvatting is verplicht')
      return false
    }
    if (!formData.content?.trim()) {
      setError('Content is verplicht')
      return false
    }
    return true
  }

  const handleSubmit = async (status: string = 'DRAFT') => {
    setError('')
    setSuccess('')

    if (!validateForm()) {
      return
    }

    try {
      setIsLoading(true)

      const submissionData = {
        ...formData,
        status,
        authorName: session?.user?.name || 'Admin',
        authorEmail: session?.user?.email || 'admin@adviesnconsultancy.nl'
      }

      const response = await fetch('/api/blog/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create blog post')
      }

      const data = await response.json()
      setSuccess(`Blog post succesvol ${status === 'PUBLISHED' ? 'gepubliceerd' : 'opgeslagen als concept'}!`)
      
      // Redirect after success
      setTimeout(() => {
        router.push('/admin/blog')
      }, 2000)

    } catch (error) {
      console.error('Error creating blog post:', error)
      setError(`Fout bij het ${status === 'PUBLISHED' ? 'publiceren' : 'opslaan'} van blog post`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button asChild variant="outline">
            <Link href="/admin/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Terug naar Blog
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Nieuwe Blog Post</h1>
            <p className="text-muted-foreground">
              Schrijf een nieuwe blog post voor het kenniscentrum
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
              <CardTitle>Blog Post Details</CardTitle>
              <CardDescription>
                Voer de basis informatie van je blog post in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Voer de titel van je blog post in"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Samenvatting *</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  placeholder="Korte samenvatting van je blog post"
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="featuredImage">Uitgelichte Afbeelding URL</Label>
                <Input
                  id="featuredImage"
                  value={formData.featuredImage}
                  onChange={(e) => handleInputChange('featuredImage', e.target.value)}
                  placeholder="https://i.ytimg.com/vi/IBccH7Yp9rg/maxresdefault.jpg"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Schrijf je blog post content hier..."
                  rows={15}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Instellingen</CardTitle>
              <CardDescription>
                Optimaliseer je blog post voor zoekmachines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Titel</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                  placeholder="SEO titel (laat leeg om automatisch te genereren)"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="metaDescription">Meta Beschrijving</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                  placeholder="SEO beschrijving voor zoekmachines"
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  value={formData.keywords}
                  onChange={(e) => handleInputChange('keywords', e.target.value)}
                  placeholder="Komma-gescheiden keywords: business continuity, BCM, compliance"
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
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={() => handleSubmit('DRAFT')} 
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? 'Opslaan...' : 'Opslaan als Concept'}
                </Button>
                
                <Button 
                  onClick={() => handleSubmit('PUBLISHED')} 
                  disabled={isLoading}
                  className="w-full"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {isLoading ? 'Publiceren...' : 'Publiceren'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Gebruik een duidelijke en aantrekkelijke titel</li>
                <li>• Schrijf een beknopte samenvatting van 1-2 zinnen</li>
                <li>• Voeg relevante keywords toe voor SEO</li>
                <li>• Gebruik headers en paragrafen voor leesbaarheid</li>
                <li>• Test eerst als concept voordat je publiceert</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

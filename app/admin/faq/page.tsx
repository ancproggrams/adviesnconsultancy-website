
'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  HelpCircle,
  Folder,
  MoreHorizontal,
  Save,
  Loader2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

type FaqCategory = {
  id: string
  name: string
  slug: string
  description: string | null
  order: number
  isActive: boolean
  createdAt: string
  _count?: { faqs: number }
}

type Faq = {
  id: string
  categoryId: string
  question: string
  answer: string
  order: number
  isActive: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
  category: FaqCategory
}

export default function FaqManagementPage() {
  const { data: session } = useSession()
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [categories, setCategories] = useState<FaqCategory[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form states
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [faqFormData, setFaqFormData] = useState({
    categoryId: '',
    question: '',
    answer: '',
    order: 0,
    isActive: true
  })

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    order: 0,
    isActive: true
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      await Promise.all([
        fetchFaqs(),
        fetchCategories()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Fout bij het ophalen van data')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFaqs = async () => {
    const response = await fetch('/api/faq')
    if (!response.ok) throw new Error('Failed to fetch FAQs')
    const data = await response.json()
    setFaqs(data.faqs || [])
  }

  const fetchCategories = async () => {
    const response = await fetch('/api/faq/categories')
    if (!response.ok) throw new Error('Failed to fetch categories')
    const data = await response.json()
    setCategories(data.categories || [])
  }

  const handleCreateFaq = async () => {
    if (!faqFormData.categoryId || !faqFormData.question || !faqFormData.answer) {
      setError('Alle velden zijn verplicht')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch('/api/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faqFormData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create FAQ')
      }

      setSuccess('FAQ succesvol aangemaakt!')
      setIsDialogOpen(false)
      setFaqFormData({ categoryId: '', question: '', answer: '', order: 0, isActive: true })
      await fetchFaqs()
    } catch (error) {
      console.error('Error creating FAQ:', error)
      setError('Fout bij het aanmaken van FAQ')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateFaq = async () => {
    if (!editingFaq) return

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/faq/${editingFaq.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faqFormData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update FAQ')
      }

      setSuccess('FAQ succesvol bijgewerkt!')
      setIsDialogOpen(false)
      setEditingFaq(null)
      setFaqFormData({ categoryId: '', question: '', answer: '', order: 0, isActive: true })
      await fetchFaqs()
    } catch (error) {
      console.error('Error updating FAQ:', error)
      setError('Fout bij het bijwerken van FAQ')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteFaq = async (faqId: string) => {
    if (!confirm('Weet je zeker dat je deze FAQ wilt verwijderen?')) return

    try {
      const response = await fetch(`/api/faq/${faqId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete FAQ')
      
      setSuccess('FAQ succesvol verwijderd!')
      await fetchFaqs()
    } catch (error) {
      console.error('Error deleting FAQ:', error)
      setError('Fout bij het verwijderen van FAQ')
    }
  }

  const handleCreateCategory = async () => {
    if (!categoryFormData.name) {
      setError('Categorienaam is verplicht')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch('/api/faq/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryFormData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create category')
      }

      setSuccess('Categorie succesvol aangemaakt!')
      setIsCategoryDialogOpen(false)
      setCategoryFormData({ name: '', description: '', order: 0, isActive: true })
      await fetchCategories()
    } catch (error) {
      console.error('Error creating category:', error)
      setError('Fout bij het aanmaken van categorie')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditDialog = (faq: Faq) => {
    setEditingFaq(faq)
    setFaqFormData({
      categoryId: faq.categoryId,
      question: faq.question,
      answer: faq.answer,
      order: faq.order,
      isActive: faq.isActive
    })
    setIsDialogOpen(true)
  }

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || faq.categoryId === filterCategory
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && faq.isActive) ||
                         (filterStatus === 'inactive' && !faq.isActive)
    return matchesSearch && matchesCategory && matchesStatus
  })

  const stats = {
    total: faqs.length,
    active: faqs.filter(f => f.isActive).length,
    categories: categories.length,
    totalViews: faqs.reduce((sum, f) => sum + f.viewCount, 0)
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">FAQ data laden...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">FAQ Beheer</h1>
          <p className="text-muted-foreground">
            Beheer veelgestelde vragen en categorieën
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Folder className="mr-2 h-4 w-4" />
                Nieuwe Categorie
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nieuwe FAQ Categorie</DialogTitle>
                <DialogDescription>
                  Maak een nieuwe categorie aan voor het organiseren van FAQ's
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="categoryName">Naam *</Label>
                  <Input
                    id="categoryName"
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Naam van de categorie"
                  />
                </div>
                <div>
                  <Label htmlFor="categoryDescription">Beschrijving</Label>
                  <Textarea
                    id="categoryDescription"
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optionele beschrijving"
                    rows={3}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="categoryActive">Actief</Label>
                  <Switch
                    id="categoryActive"
                    checked={categoryFormData.isActive}
                    onCheckedChange={(checked) => setCategoryFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                </div>
                <Button onClick={handleCreateCategory} disabled={isSubmitting} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Opslaan...' : 'Categorie Aanmaken'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nieuwe FAQ
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingFaq ? 'FAQ Bewerken' : 'Nieuwe FAQ'}</DialogTitle>
                <DialogDescription>
                  {editingFaq ? 'Bewerk de details van deze FAQ' : 'Voeg een nieuwe veelgestelde vraag toe'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="faqCategory">Categorie *</Label>
                  <Select value={faqFormData.categoryId} onValueChange={(value) => setFaqFormData(prev => ({ ...prev, categoryId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer een categorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c.isActive).map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="faqQuestion">Vraag *</Label>
                  <Input
                    id="faqQuestion"
                    value={faqFormData.question}
                    onChange={(e) => setFaqFormData(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="Voer de vraag in"
                  />
                </div>
                <div>
                  <Label htmlFor="faqAnswer">Antwoord *</Label>
                  <Textarea
                    id="faqAnswer"
                    value={faqFormData.answer}
                    onChange={(e) => setFaqFormData(prev => ({ ...prev, answer: e.target.value }))}
                    placeholder="Voer het antwoord in"
                    rows={5}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="faqActive">Actief</Label>
                  <Switch
                    id="faqActive"
                    checked={faqFormData.isActive}
                    onCheckedChange={(checked) => setFaqFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                </div>
                <Button 
                  onClick={editingFaq ? handleUpdateFaq : handleCreateFaq} 
                  disabled={isSubmitting} 
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Opslaan...' : (editingFaq ? 'FAQ Bijwerken' : 'FAQ Aanmaken')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <HelpCircle className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Totaal FAQ's</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Actief</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Folder className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Categorieën</p>
                <p className="text-2xl font-bold">{stats.categories}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Totaal Weergaven</p>
                <p className="text-2xl font-bold">{stats.totalViews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Zoek FAQ's..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Categorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Categorieën</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="active">Actief</SelectItem>
                  <SelectItem value="inactive">Inactief</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vraag</TableHead>
                  <TableHead>Categorie</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Weergaven</TableHead>
                  <TableHead className="w-[100px]">Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFaqs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {searchTerm ? 'Geen FAQ\'s gevonden met deze zoekterm' : 'Nog geen FAQ\'s gevonden'}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFaqs.map((faq) => (
                    <TableRow key={faq.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{faq.question}</div>
                          <div className="text-sm text-muted-foreground">
                            {faq.answer.substring(0, 100)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{faq.category.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={faq.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {faq.isActive ? 'Actief' : 'Inactief'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-2" />
                          {faq.viewCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(faq)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Bewerken
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteFaq(faq.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Verwijderen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

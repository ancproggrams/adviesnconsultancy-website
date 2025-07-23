'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  Building,
  Clock,
  BookOpen,
  MoreHorizontal
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Alert, AlertDescription } from '@/components/ui/alert'

type CaseStudy = {
  id: string
  title: string
  slug: string
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

export default function CaseStudiesManagementPage() {
  const { data: session } = useSession()
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterIndustry, setFilterIndustry] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCaseStudies()
  }, [])

  const fetchCaseStudies = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/case-studies')
      if (!response.ok) {
        throw new Error('Failed to fetch case studies')
      }
      const data = await response.json()
      setCaseStudies(data.caseStudies || [])
    } catch (error) {
      console.error('Error fetching case studies:', error)
      setError('Fout bij het ophalen van case studies')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCaseStudy = async (caseStudyId: string) => {
    if (!confirm('Weet je zeker dat je deze case study wilt verwijderen?')) {
      return
    }

    try {
      const response = await fetch(`/api/case-studies/${caseStudyId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete case study')
      }

      await fetchCaseStudies()
    } catch (error) {
      console.error('Error deleting case study:', error)
      setError('Fout bij het verwijderen van case study')
    }
  }

  const handleStatusChange = async (caseStudyId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/case-studies/${caseStudyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update case study status')
      }

      await fetchCaseStudies()
    } catch (error) {
      console.error('Error updating case study status:', error)
      setError('Fout bij het bijwerken van case study status')
    }
  }

  const industries = [...new Set(caseStudies.map(cs => cs.industry))]
  
  const filteredCaseStudies = caseStudies.filter(caseStudy => {
    const matchesSearch = caseStudy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseStudy.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseStudy.challenge.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || caseStudy.status === filterStatus
    const matchesIndustry = filterIndustry === 'all' || caseStudy.industry === filterIndustry
    return matchesSearch && matchesStatus && matchesIndustry
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800'
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800'
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const stats = {
    total: caseStudies.length,
    published: caseStudies.filter(cs => cs.status === 'PUBLISHED').length,
    draft: caseStudies.filter(cs => cs.status === 'DRAFT').length,
    archived: caseStudies.filter(cs => cs.status === 'ARCHIVED').length
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Case Studies Management</h1>
          <p className="text-muted-foreground">
            Beheer case studies en klantprojecten
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/case-studies/new">
            <Plus className="mr-2 h-4 w-4" />
            Nieuwe Case Study
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Totaal</p>
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
                <p className="text-sm font-medium text-muted-foreground">Gepubliceerd</p>
                <p className="text-2xl font-bold">{stats.published}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Edit className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Concepten</p>
                <p className="text-2xl font-bold">{stats.draft}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Trash2 className="h-8 w-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Gearchiveerd</p>
                <p className="text-2xl font-bold">{stats.archived}</p>
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
                placeholder="Zoek case studies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
              >
                Alle
              </Button>
              <Button 
                variant={filterStatus === 'PUBLISHED' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('PUBLISHED')}
                size="sm"
              >
                Gepubliceerd
              </Button>
              <Button 
                variant={filterStatus === 'DRAFT' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('DRAFT')}
                size="sm"
              >
                Concepten
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Laden...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titel</TableHead>
                    <TableHead>Industrie</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duur</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead className="w-[100px]">Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCaseStudies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="text-muted-foreground">
                          {searchTerm ? 'Geen case studies gevonden met deze zoekterm' : 'Nog geen case studies gevonden'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCaseStudies.map((caseStudy) => (
                      <TableRow key={caseStudy.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{caseStudy.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {caseStudy.challenge.substring(0, 100)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-2" />
                            {caseStudy.industry}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(caseStudy.status)}>
                            {caseStudy.status.toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {caseStudy.duration}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {caseStudy.publishedAt 
                              ? new Date(caseStudy.publishedAt).toLocaleDateString('nl-NL')
                              : new Date(caseStudy.createdAt).toLocaleDateString('nl-NL')
                            }
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
                              <DropdownMenuItem asChild>
                                <Link href={`/case-studies/${caseStudy.slug}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Bekijken
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/case-studies/edit/${caseStudy.id}`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Bewerken
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {caseStudy.status === 'DRAFT' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(caseStudy.id, 'PUBLISHED')}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Publiceren
                                </DropdownMenuItem>
                              )}
                              {caseStudy.status === 'PUBLISHED' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(caseStudy.id, 'DRAFT')}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Terug naar concept
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleStatusChange(caseStudy.id, 'ARCHIVED')}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Archiveren
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteCaseStudy(caseStudy.id)}
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}

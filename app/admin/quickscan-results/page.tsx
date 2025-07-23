'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Search, 
  Eye, 
  Calendar,
  Building,
  User,
  BarChart3,
  FileText,
  Phone,
  Mail,
  MoreHorizontal,
  Download,
  MessageCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'

type QuickScanResult = {
  id: string
  name: string
  email: string
  company: string
  phone: string | null
  position: string | null
  hasBcmOfficer: boolean
  hasCrisisTeam: boolean
  responses: any
  contextScore: number
  leadershipScore: number
  planningScore: number
  supportScore: number
  operationScore: number
  performanceScore: number
  improvementScore: number
  overallScore: number
  maturityLevel: string
  reportGenerated: boolean
  reportUrl: string | null
  wantsConsultation: boolean
  consultationScheduled: boolean
  createdAt: string
  updatedAt: string
}

export default function QuickScanResultsPage() {
  const { data: session } = useSession()
  const [quickScans, setQuickScans] = useState<QuickScanResult[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMaturity, setFilterMaturity] = useState<string>('all')
  const [filterConsultation, setFilterConsultation] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchQuickScans()
  }, [])

  const fetchQuickScans = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/quickscan')
      if (!response.ok) {
        throw new Error('Failed to fetch QuickScan results')
      }
      const data = await response.json()
      setQuickScans(data.results || [])
    } catch (error) {
      console.error('Error fetching QuickScan results:', error)
      setError('Fout bij het ophalen van QuickScan resultaten')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateReport = async (quickScanId: string) => {
    try {
      const response = await fetch(`/api/quickscan/${quickScanId}/report`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      await fetchQuickScans()
    } catch (error) {
      console.error('Error generating report:', error)
      setError('Fout bij het genereren van rapport')
    }
  }

  const handleScheduleConsultation = async (quickScanId: string) => {
    try {
      const response = await fetch(`/api/quickscan/${quickScanId}/consultation`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to schedule consultation')
      }

      await fetchQuickScans()
    } catch (error) {
      console.error('Error scheduling consultation:', error)
      setError('Fout bij het plannen van adviesgesprek')
    }
  }

  const getMaturityColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-red-100 text-red-800'
      case 'developing':
        return 'bg-yellow-100 text-yellow-800'
      case 'defined':
        return 'bg-blue-100 text-blue-800'
      case 'managed':
        return 'bg-green-100 text-green-800'
      case 'optimizing':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const filteredQuickScans = quickScans.filter(scan => {
    const matchesSearch = scan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scan.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scan.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMaturity = filterMaturity === 'all' || scan.maturityLevel.toLowerCase() === filterMaturity
    const matchesConsultation = filterConsultation === 'all' || 
                               (filterConsultation === 'requested' && scan.wantsConsultation) ||
                               (filterConsultation === 'scheduled' && scan.consultationScheduled) ||
                               (filterConsultation === 'none' && !scan.wantsConsultation)
    return matchesSearch && matchesMaturity && matchesConsultation
  })

  const stats = {
    total: quickScans.length,
    consultationRequests: quickScans.filter(qs => qs.wantsConsultation).length,
    scheduled: quickScans.filter(qs => qs.consultationScheduled).length,
    averageScore: quickScans.length > 0 ? Math.round(quickScans.reduce((sum, qs) => sum + qs.overallScore, 0) / quickScans.length) : 0
  }

  const maturityLevels = [...new Set(quickScans.map(qs => qs.maturityLevel))]

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">QuickScan Resultaten</h1>
          <p className="text-muted-foreground">
            Bekijk en beheer QuickScan resultaten en adviesaanvragen
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Totaal Scans</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Adviesaanvragen</p>
                <p className="text-2xl font-bold">{stats.consultationRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Gesprekken Gepland</p>
                <p className="text-2xl font-bold">{stats.scheduled}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Gemiddelde Score</p>
                <p className="text-2xl font-bold">{stats.averageScore}%</p>
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
                placeholder="Zoek QuickScan resultaten..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={filterConsultation === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterConsultation('all')}
                size="sm"
              >
                Alle
              </Button>
              <Button 
                variant={filterConsultation === 'requested' ? 'default' : 'outline'}
                onClick={() => setFilterConsultation('requested')}
                size="sm"
              >
                Advies Aangevraagd
              </Button>
              <Button 
                variant={filterConsultation === 'scheduled' ? 'default' : 'outline'}
                onClick={() => setFilterConsultation('scheduled')}
                size="sm"
              >
                Gesprek Gepland
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
                    <TableHead>Contact</TableHead>
                    <TableHead>Bedrijf</TableHead>
                    <TableHead>Overall Score</TableHead>
                    <TableHead>Maturity Level</TableHead>
                    <TableHead>Advies</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead className="w-[100px]">Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuickScans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-muted-foreground">
                          {searchTerm ? 'Geen QuickScan resultaten gevonden met deze zoekterm' : 'Nog geen QuickScan resultaten gevonden'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredQuickScans.map((scan) => (
                      <TableRow key={scan.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium flex items-center">
                              <User className="h-4 w-4 mr-2" />
                              {scan.name}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {scan.email}
                            </div>
                            {scan.phone && (
                              <div className="text-sm text-muted-foreground flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {scan.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-2" />
                            <div>
                              <div className="font-medium">{scan.company}</div>
                              {scan.position && (
                                <div className="text-sm text-muted-foreground">{scan.position}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className={`text-2xl font-bold ${getScoreColor(scan.overallScore)}`}>
                              {scan.overallScore}%
                            </div>
                            <div className="w-16">
                              <Progress value={scan.overallScore} className="h-2" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getMaturityColor(scan.maturityLevel)}>
                            {scan.maturityLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            {scan.wantsConsultation ? (
                              <div className="flex items-center text-green-600">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Aangevraagd
                              </div>
                            ) : (
                              <div className="flex items-center text-gray-500">
                                <XCircle className="h-4 w-4 mr-1" />
                                Niet aangevraagd
                              </div>
                            )}
                            {scan.consultationScheduled && (
                              <div className="flex items-center text-blue-600">
                                <Calendar className="h-4 w-4 mr-1" />
                                Gepland
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(scan.createdAt).toLocaleDateString('nl-NL')}
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
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Details bekijken
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {!scan.reportGenerated && (
                                <DropdownMenuItem onClick={() => handleGenerateReport(scan.id)}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Rapport genereren
                                </DropdownMenuItem>
                              )}
                              {scan.reportUrl && (
                                <DropdownMenuItem asChild>
                                  <a href={scan.reportUrl} target="_blank" rel="noopener noreferrer">
                                    <Download className="mr-2 h-4 w-4" />
                                    Rapport downloaden
                                  </a>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              {scan.wantsConsultation && !scan.consultationScheduled && (
                                <DropdownMenuItem onClick={() => handleScheduleConsultation(scan.id)}>
                                  <Calendar className="mr-2 h-4 w-4" />
                                  Gesprek plannen
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Contact opnemen
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


'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Download, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  Building,
  Mail,
  Phone,
  LogOut
} from 'lucide-react'
import { CustomerProject, CustomerDocument } from '@/lib/types'

export function CustomerDashboard() {
  const [projects, setProjects] = useState<CustomerProject[]>([])
  const [documents, setDocuments] = useState<CustomerDocument[]>([])
  const [loading, setLoading] = useState(true)

  // Mock customer data - in real app, this would come from authentication
  const customer = {
    id: "mock-customer-id",
    name: "Jan Smit",
    company: "TechCorp B.V.",
    email: "jan.smit@techcorp.nl",
    phone: "+31 6 12345678",
    hashedPassword: "",
    isActive: true,
    lastLogin: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    projects: [],
    documents: []
  }

  useEffect(() => {
    fetchCustomerData()
  }, [])

  const fetchCustomerData = async () => {
    try {
      // Mock data for demonstration
      const mockProjects: CustomerProject[] = [
        {
          id: '1',
          customerId: '1',
          name: 'ISO 22301 Implementatie',
          description: 'Volledige implementatie van Business Continuity Management System',
          status: 'ACTIVE',
          progress: 65,
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-06-15'),
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
          customer: customer,
          documents: []
        },
        {
          id: '2',
          customerId: '1',
          name: 'Crisis Team Training',
          description: 'Training programma voor crisis response team',
          status: 'COMPLETED',
          progress: 100,
          startDate: new Date('2023-11-01'),
          endDate: new Date('2023-12-01'),
          createdAt: new Date('2023-11-01'),
          updatedAt: new Date('2023-12-01'),
          customer: customer,
          documents: []
        }
      ]

      const mockDocuments: CustomerDocument[] = [
        {
          id: '1',
          customerId: '1',
          projectId: '1',
          title: 'BCM Beleidsdocument v2.1',
          description: 'Goedgekeurde versie van het BCM beleid',
          fileName: 'bcm-beleid-v2.1.pdf',
          fileUrl: '/documents/bcm-beleid-v2.1.pdf',
          fileSize: 2456789,
          mimeType: 'application/pdf',
          isConfidential: false,
          uploadedAt: new Date('2024-01-20'),
          customer: customer,
          project: mockProjects[0]
        },
        {
          id: '2',
          customerId: '1',
          projectId: '1',
          title: 'Risk Assessment Report',
          description: 'Uitgebreide risicobeoordeling voor kritieke processen',
          fileName: 'risk-assessment-report.pdf',
          fileUrl: '/documents/risk-assessment-report.pdf',
          fileSize: 1234567,
          mimeType: 'application/pdf',
          isConfidential: true,
          uploadedAt: new Date('2024-01-25'),
          customer: customer,
          project: mockProjects[0]
        }
      ]

      setProjects(mockProjects)
      setDocuments(mockDocuments)
    } catch (error) {
      console.error('Error fetching customer data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      'ACTIVE': <Badge className="bg-blue-100 text-blue-700">Actief</Badge>,
      'COMPLETED': <Badge className="bg-green-100 text-green-700">Voltooid</Badge>,
      'PAUSED': <Badge className="bg-yellow-100 text-yellow-700">Gepauzeerd</Badge>,
      'CANCELLED': <Badge className="bg-red-100 text-red-700">Geannuleerd</Badge>
    }
    return badges[status as keyof typeof badges] || <Badge variant="secondary">{status}</Badge>
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welkom terug, {customer.name}</h1>
          <p className="text-muted-foreground">
            Overzicht van uw projecten en documenten
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Uitloggen
        </Button>
      </div>

      {/* Customer Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Accountgegevens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Building className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">{customer.company}</div>
                <div className="text-sm text-muted-foreground">Bedrijf</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">{customer.email}</div>
                <div className="text-sm text-muted-foreground">E-mail</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">{customer.phone}</div>
                <div className="text-sm text-muted-foreground">Telefoon</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Actieve Projecten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter(p => p.status === 'ACTIVE').length}
            </div>
            <div className="text-xs text-muted-foreground">In uitvoering</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Voltooide Projecten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter(p => p.status === 'COMPLETED').length}
            </div>
            <div className="text-xs text-muted-foreground">Afgerond</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Documenten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <div className="text-xs text-muted-foreground">Beschikbaar</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList>
          <TabsTrigger value="projects">Projecten</TabsTrigger>
          <TabsTrigger value="documents">Documenten</TabsTrigger>
          <TabsTrigger value="timeline">Tijdlijn</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mijn Projecten</CardTitle>
              <CardDescription>
                Overzicht van al uw projecten en hun voortgang
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {projects.map((project) => (
                  <div key={project.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{project.name}</h3>
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                      </div>
                      {getStatusBadge(project.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {project.startDate.toLocaleDateString('nl-NL')} - {project.endDate?.toLocaleDateString('nl-NL')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {project.status === 'ACTIVE' ? 'In uitvoering' : 'Voltooid'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Voortgang</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Projectdocumenten</CardTitle>
              <CardDescription>
                Alle documenten gerelateerd aan uw projecten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Naam</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Grootte</TableHead>
                    <TableHead>Geüpload</TableHead>
                    <TableHead>Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{doc.title}</div>
                            <div className="text-sm text-muted-foreground">{doc.description}</div>
                          </div>
                          {doc.isConfidential && (
                            <Badge variant="secondary" className="text-xs">
                              Vertrouwelijk
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{doc.project?.name || 'Algemeen'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatFileSize(doc.fileSize || 0)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {doc.uploadedAt.toLocaleDateString('nl-NL')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Tijdlijn</CardTitle>
              <CardDescription>
                Chronologisch overzicht van alle projectactiviteiten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  {
                    date: '2024-01-25',
                    title: 'Risk Assessment voltooid',
                    description: 'Uitgebreide risicobeoordeling afgerond en gerapporteerd',
                    type: 'completed'
                  },
                  {
                    date: '2024-01-20',
                    title: 'BCM Beleid goedgekeurd',
                    description: 'Beleidsdocument officieel goedgekeurd door management',
                    type: 'completed'
                  },
                  {
                    date: '2024-01-15',
                    title: 'Project ISO 22301 gestart',
                    description: 'Kick-off meeting en projectplanning voltooid',
                    type: 'completed'
                  },
                  {
                    date: '2024-02-01',
                    title: 'Gap analyse gepland',
                    description: 'Uitgebreide gap analyse van huidige situatie',
                    type: 'upcoming'
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="p-2 bg-gray-100 rounded-full">
                      {item.type === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{item.title}</h4>
                        <span className="text-sm text-muted-foreground">
                          {new Date(item.date).toLocaleDateString('nl-NL')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

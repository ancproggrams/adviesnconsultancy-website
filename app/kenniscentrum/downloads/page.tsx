


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, FileText, FileSpreadsheet, Presentation, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Downloads & Templates - Kenniscentrum',
  description: 'Download praktische templates, checklists en resources voor business continuiteit en ISO 22301 compliance.',
}

export default function DownloadsPage() {
  // TODO: Replace with real downloads from CMS/database
  const downloads: any[] = []

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return FileText
      case 'excel':
      case 'xlsx':
        return FileSpreadsheet
      case 'powerbi':
      case 'pptx':
        return Presentation
      default:
        return FileText
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'checklist':
        return 'bg-blue-100 text-blue-800'
      case 'template':
        return 'bg-green-100 text-green-800'
      case 'guide':
        return 'bg-purple-100 text-purple-800'
      case 'policy':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const categories = [
    {
      name: 'ISO 22301 Templates',
      description: 'Templates en documenten voor ISO 22301 implementatie',
      count: 0
    },
    {
      name: 'Checklists',
      description: 'Praktische checklists voor compliance assessments',
      count: 0
    },
    {
      name: 'Beleidsdocumenten',
      description: 'Voorbeelden van business continuity beleidswijzers',
      count: 0
    },
    {
      name: 'Dashboards',
      description: 'Dashboard templates voor compliance monitoring',
      count: 0
    }
  ]

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-6xl">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Button asChild variant="ghost" size="sm">
            <Link href="/kenniscentrum" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Terug naar Kenniscentrum
            </Link>
          </Button>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Downloads & Templates
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Download praktische templates, checklists en resources om uw business continuity 
            en compliance processen te verbeteren.
          </p>
        </div>

        {/* Categories Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {categories.map((category, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Download className="h-8 w-8 text-primary mx-auto" />
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                  <Badge variant="secondary">
                    {category.count} beschikbaar
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Downloads List */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-foreground">Beschikbare Downloads</h2>
          </div>

          {downloads.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent className="space-y-6">
                <Download className="h-16 w-16 text-muted-foreground mx-auto" />
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold">Downloads komen binnenkort beschikbaar</h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Wij werken aan het samenstellen van een uitgebreide bibliotheek met praktische 
                    templates, checklists en resources voor ISO 22301 compliance en business continuity management.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mt-8">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">Wat u kunt verwachten:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1 text-left">
                        <li>• ISO 22301 implementatie templates</li>
                        <li>• Business Impact Analysis worksheets</li>
                        <li>• Compliance assessment checklists</li>
                        <li>• Incident response playbooks</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">Wanneer beschikbaar:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1 text-left">
                        <li>• Q2 2024: Basis templates</li>
                        <li>• Q3 2024: Geavanceerde resources</li>
                        <li>• Q4 2024: Dashboard templates</li>
                        <li>• Doorlopend: Nieuwe updates</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="btn-primary">
                    <Link href="/adviesgesprek">
                      Vraag naar specifieke templates
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/compliance-automation#quickscan">
                      Start Quick Scan
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {downloads.map((download: any, index: number) => {
                const FileIcon = getFileIcon(download.type)
                return (
                  <Card key={index} className="card-hover">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <FileIcon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{download.title}</CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge 
                                variant="secondary" 
                                className={getCategoryColor(download.category)}
                              >
                                {download.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {download.type.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription>{download.description}</CardDescription>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {download.downloadCount || 0} downloads
                        </span>
                        <Button size="sm" className="btn-primary">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-muted/50 rounded-lg p-12 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-foreground">
              Hulp nodig bij implementatie?
            </h2>
            <p className="text-xl text-muted-foreground">
              Onze experts helpen u graag bij het implementeren van business continuity 
              en compliance processen in uw organisatie.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="btn-primary">
                <Link href="/adviesgesprek">
                  Plan Adviesgesprek
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/diensten">
                  Bekijk Diensten
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

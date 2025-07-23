
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Presentation, 
  BookOpen,
  Search,
  Filter,
  Calendar,
  Eye
} from 'lucide-react'

export default function ResourcesPage() {
  const resources = [
    {
      title: "BCM Beleidssjabloon",
      description: "Uitgebreide sjabloon voor het opstellen van een business continuity beleid volgens ISO 22301",
      category: "Templates",
      type: "DOC",
      downloadCount: 1247,
      publishedAt: "2024-01-15",
      fileSize: "156 KB",
      isPremium: false
    },
    {
      title: "Risk Assessment Matrix",
      description: "Excel template voor het uitvoeren van business impact analyses en risicobeoordelingen",
      category: "Tools",
      type: "XLSX",
      downloadCount: 892,
      publishedAt: "2024-01-10",
      fileSize: "245 KB",
      isPremium: false
    },
    {
      title: "Crisis Communication Plan",
      description: "Sjabloon voor het opstellen van een effectief crisis communicatie plan",
      category: "Templates",
      type: "DOC",
      downloadCount: 634,
      publishedAt: "2024-01-05",
      fileSize: "198 KB",
      isPremium: false
    },
    {
      title: "BCM Implementation Roadmap",
      description: "Stap-voor-stap implementatie gids voor business continuity management",
      category: "Guides",
      type: "PDF",
      downloadCount: 1089,
      publishedAt: "2023-12-20",
      fileSize: "2.1 MB",
      isPremium: true
    },
    {
      title: "ISO 22301 Checklist",
      description: "Uitgebreide checklist voor ISO 22301 compliance verificatie",
      category: "Checklists",
      type: "PDF",
      downloadCount: 756,
      publishedAt: "2023-12-15",
      fileSize: "342 KB",
      isPremium: false
    },
    {
      title: "Crisis Team Training Presentatie",
      description: "PowerPoint presentatie voor het trainen van crisis teams",
      category: "Training",
      type: "PPTX",
      downloadCount: 423,
      publishedAt: "2023-12-10",
      fileSize: "8.7 MB",
      isPremium: true
    },
    {
      title: "Business Impact Analysis Werkboek",
      description: "Praktisch werkboek voor het uitvoeren van business impact analyses",
      category: "Workbooks",
      type: "PDF",
      downloadCount: 567,
      publishedAt: "2023-12-05",
      fileSize: "1.8 MB",
      isPremium: true
    },
    {
      title: "Recovery Time Objectives Calculator",
      description: "Excel tool voor het berekenen en valideren van recovery time objectives",
      category: "Tools",
      type: "XLSX",
      downloadCount: 345,
      publishedAt: "2023-11-30",
      fileSize: "187 KB",
      isPremium: false
    }
  ]

  const categories = [
    "Alle categorieën",
    "Templates",
    "Tools",
    "Guides",
    "Checklists",
    "Training",
    "Workbooks"
  ]

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="h-5 w-5 text-red-500" />
      case 'XLSX':
        return <FileSpreadsheet className="h-5 w-5 text-green-500" />
      case 'DOC':
        return <FileText className="h-5 w-5 text-blue-500" />
      case 'PPTX':
        return <Presentation className="h-5 w-5 text-orange-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Resources & Downloads
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Gratis templates, tools en gidsen om uw business continuity management te versterken.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600 mb-2">50+</div>
            <div className="text-sm text-muted-foreground">Resources</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600 mb-2">10K+</div>
            <div className="text-sm text-muted-foreground">Downloads</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-purple-600 mb-2">8</div>
            <div className="text-sm text-muted-foreground">Categorieën</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-orange-600 mb-2">25</div>
            <div className="text-sm text-muted-foreground">Gratis</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Zoek resources..."
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select defaultValue="alle">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Categorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase().replace(' ', '-')}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select defaultValue="nieuwste">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sorteer op" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nieuwste">Nieuwste eerst</SelectItem>
                  <SelectItem value="oudste">Oudste eerst</SelectItem>
                  <SelectItem value="populair">Meest populair</SelectItem>
                  <SelectItem value="naam">Naam A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {resources.map((resource, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getFileIcon(resource.type)}
                  <div>
                    <Badge variant="secondary" className="text-xs">
                      {resource.category}
                    </Badge>
                    {resource.isPremium && (
                      <Badge className="ml-2 bg-gold-100 text-gold-700 text-xs">
                        Premium
                      </Badge>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {resource.type}
                </Badge>
              </div>
              <CardTitle className="text-lg">{resource.title}</CardTitle>
              <CardDescription className="text-sm">
                {resource.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    <span>{resource.downloadCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(resource.publishedAt)}</span>
                  </div>
                </div>
                <span>{resource.fileSize}</span>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Newsletter CTA */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-8 text-center">
          <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-4">
            Blijf op de hoogte
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Ontvang nieuwe resources, templates en BCM insights direct in uw inbox. 
            Geen spam, alleen waardevolle content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Input
              placeholder="Uw e-mailadres"
              className="flex-1"
            />
            <Button>
              Aanmelden
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

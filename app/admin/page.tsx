


export const dynamic = 'force-dynamic'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Download, 
  BookOpen, 
  BarChart3,
  Plus,
  Eye,
  Edit,
  Users,
  MessageSquare,
  HelpCircle,
  Shield
} from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  // TODO: Replace with real data from database
  const stats = {
    blogPosts: { total: 0, published: 0, drafts: 0 },
    caseStudies: { total: 0, published: 0 },
    faqs: { total: 0, active: 0 },
    quickScans: { total: 0, thisMonth: 0 }
  }

  const recentActivity: Array<{
    title: string
    description: string
    type: string
    date: string
  }> = [
    // TODO: Replace with real recent activity data
  ]

  const quickActions = [
    {
      title: 'Nieuw Blog Post',
      description: 'Schrijf een nieuw artikel',
      href: '/admin/blog/new',
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      title: 'Team Management',
      description: 'Beheer teamleden',
      href: '/admin/team',
      icon: Users,
      color: 'bg-emerald-500'
    },
    {
      title: 'Case Study',
      description: 'Maak nieuwe case study',
      href: '/admin/case-studies/new',
      icon: BookOpen,
      color: 'bg-purple-500'
    },
    {
      title: 'FAQ Beheer',
      description: 'Beheer veelgestelde vragen',
      href: '/admin/faq',
      icon: HelpCircle,
      color: 'bg-yellow-500'
    },
    {
      title: 'Chatbot Config',
      description: 'Chatbot instellingen',
      href: '/admin/chatbot',
      icon: MessageSquare,
      color: 'bg-indigo-500'
    },
    {
      title: 'QuickScan Data',
      description: 'Bekijk scan resultaten',
      href: '/admin/quickscan-results',
      icon: BarChart3,
      color: 'bg-orange-500'
    },
    {
      title: 'Business Dashboard',
      description: 'Analytics en rapporten',
      href: '/admin/dashboard',
      icon: BarChart3,
      color: 'bg-teal-500'
    },
    {
      title: 'CRM & Leads',
      description: 'Lead management',
      href: '/admin/dashboard?tab=leads',
      icon: Users,
      color: 'bg-pink-500'
    },
    {
      title: 'Security Dashboard',
      description: 'Security monitoring & management',
      href: '/admin/security',
      icon: Shield,
      color: 'bg-red-500'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">CMS Dashboard</h1>
        <p className="text-muted-foreground">
          Beheer uw content en bekijk statistieken
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.blogPosts.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.blogPosts.published} gepubliceerd, {stats.blogPosts.drafts} concepten
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">FAQ's</CardTitle>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.faqs.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.faqs.active} actief beschikbaar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Case Studies</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.caseStudies.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.caseStudies.published} gepubliceerd
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QuickScans</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.quickScans.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.quickScans.thisMonth} deze maand
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Snelle Acties</CardTitle>
          <CardDescription>
            Veel gebruikte functionaliteiten
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                asChild
                variant="outline"
                className="h-24 flex-col space-y-2"
              >
                <Link href={action.href}>
                  <div className={`p-2 rounded-full ${action.color}`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recente Activiteit</CardTitle>
          <CardDescription>
            Laatste wijzigingen in het CMS
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                Nog geen activiteit om te tonen
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Begin met het toevoegen van content om activiteit te zien
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-muted rounded-full">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">{activity.title}</div>
                      <div className="text-sm text-muted-foreground">{activity.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

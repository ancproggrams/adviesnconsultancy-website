export const dynamic = 'force-dynamic'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  FileText, 
  Mail,
  Phone,
  Target,
  BarChart3,
  Calendar,
  Download
} from 'lucide-react'
import { DashboardOverview } from '@/components/dashboard/dashboard-overview'
import { LeadsAnalytics } from '@/components/dashboard/leads-analytics'
import { ConversationAnalytics } from '@/components/dashboard/conversation-analytics'
import { QuickScanAnalytics } from '@/components/dashboard/quickscan-analytics'
import { RecentActivities } from '@/components/dashboard/recent-activities'

export default function AdminBusinessDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Business Intelligence Dashboard</h1>
          <p className="text-muted-foreground">
            Overzicht van leads, conversies en bedrijfsprestaties
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Periode
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overzicht</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="conversations">Gesprekken</TabsTrigger>
          <TabsTrigger value="quickscan">QuickScan</TabsTrigger>
          <TabsTrigger value="activities">Activiteiten</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <DashboardOverview />
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          <LeadsAnalytics />
        </TabsContent>

        <TabsContent value="conversations" className="space-y-6">
          <ConversationAnalytics />
        </TabsContent>

        <TabsContent value="quickscan" className="space-y-6">
          <QuickScanAnalytics />
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          <RecentActivities />
        </TabsContent>
      </Tabs>
    </div>
  )
}

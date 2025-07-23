
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Activity,
  MessageSquare,
  FileText,
  Mail,
  Phone,
  Calendar,
  User,
  Bot,
  Download,
  Star,
  Building
} from 'lucide-react'

interface ActivityItem {
  id: string
  type: string
  title: string
  description: string
  user?: string
  userEmail?: string
  timestamp: string
  metadata?: any
}

export function RecentActivities() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/dashboard/activities')
      const data = await response.json()
      setActivities(data.activities)
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    const icons = {
      'chatbot_conversation': <Bot className="h-4 w-4 text-blue-600" />,
      'quickscan_completed': <FileText className="h-4 w-4 text-purple-600" />,
      'contact_form': <Mail className="h-4 w-4 text-green-600" />,
      'newsletter_signup': <Mail className="h-4 w-4 text-orange-600" />,
      'report_downloaded': <Download className="h-4 w-4 text-gray-600" />,
      'consultation_requested': <Calendar className="h-4 w-4 text-red-600" />,
      'lead_qualified': <Star className="h-4 w-4 text-yellow-600" />
    }
    return icons[type as keyof typeof icons] || <Activity className="h-4 w-4 text-gray-600" />
  }

  const getActivityBadge = (type: string) => {
    const badges = {
      'chatbot_conversation': <Badge className="bg-blue-100 text-blue-700">Chatbot</Badge>,
      'quickscan_completed': <Badge className="bg-purple-100 text-purple-700">QuickScan</Badge>,
      'contact_form': <Badge className="bg-green-100 text-green-700">Contact</Badge>,
      'newsletter_signup': <Badge className="bg-orange-100 text-orange-700">Newsletter</Badge>,
      'report_downloaded': <Badge variant="secondary">Download</Badge>,
      'consultation_requested': <Badge className="bg-red-100 text-red-700">Consultatie</Badge>,
      'lead_qualified': <Badge className="bg-yellow-100 text-yellow-700">Lead</Badge>
    }
    return badges[type as keyof typeof badges] || <Badge variant="secondary">{type}</Badge>
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / 60000)
    
    if (diffInMinutes < 1) return 'Net nu'
    if (diffInMinutes < 60) return `${diffInMinutes} min geleden`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} uur geleden`
    return `${Math.floor(diffInMinutes / 1440)} dagen geleden`
  }

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true
    return activity.type === filter
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Activity Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Vandaag</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activities.filter(a => {
                const today = new Date()
                const activityDate = new Date(a.timestamp)
                return activityDate.toDateString() === today.toDateString()
              }).length}
            </div>
            <div className="text-xs text-muted-foreground">Activiteiten</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Deze Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activities.filter(a => {
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return new Date(a.timestamp) > weekAgo
              }).length}
            </div>
            <div className="text-xs text-muted-foreground">Activiteiten</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Nieuwe Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activities.filter(a => a.type === 'lead_qualified').length}
            </div>
            <div className="text-xs text-muted-foreground">Gekwalificeerd</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Consultaties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activities.filter(a => a.type === 'consultation_requested').length}
            </div>
            <div className="text-xs text-muted-foreground">Aangevraagd</div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Activiteiten Feed</CardTitle>
          <CardDescription>Overzicht van alle recente activiteiten</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Alles
            </Button>
            <Button
              variant={filter === 'chatbot_conversation' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('chatbot_conversation')}
            >
              Chatbot
            </Button>
            <Button
              variant={filter === 'quickscan_completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('quickscan_completed')}
            >
              QuickScan
            </Button>
            <Button
              variant={filter === 'contact_form' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('contact_form')}
            >
              Contact
            </Button>
            <Button
              variant={filter === 'lead_qualified' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('lead_qualified')}
            >
              Leads
            </Button>
          </div>

          {/* Activity List */}
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                <div className="p-2 bg-gray-100 rounded-full">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{activity.title}</h4>
                      {getActivityBadge(activity.type)}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity.description}
                  </p>
                  {activity.user && (
                    <div className="flex items-center gap-2 mt-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {activity.user.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{activity.user}</span>
                      {activity.userEmail && (
                        <span className="text-sm text-muted-foreground">
                          • {activity.userEmail}
                        </span>
                      )}
                    </div>
                  )}
                  {activity.metadata && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      {activity.metadata.company && (
                        <span className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {activity.metadata.company}
                        </span>
                      )}
                      {activity.metadata.score && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Score: {activity.metadata.score}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredActivities.length === 0 && (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                Geen activiteiten gevonden voor het geselecteerde filter
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

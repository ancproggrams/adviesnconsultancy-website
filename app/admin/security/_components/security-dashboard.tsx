
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertTriangle, Shield, Key, Activity, FileText, Users, AlertCircle, CheckCircle, Clock, Database } from 'lucide-react'
import { toast } from 'sonner'
import SecurityEvents from './security-events'
import ApiKeyManager from './api-key-manager'
import SecurityAlerts from './security-alerts'
import GdprManager from './gdpr-manager'
import FileUploader from './file-uploader'

interface DashboardData {
  recentEvents: any[]
  eventsByType: any[]
  eventsBySeverity: any[]
  activeAlerts: any[]
  apiUsageStats: any[]
}

interface SecurityStats {
  totalEvents: number
  criticalAlerts: number
  activeApiKeys: number
  activeSessions: number
  pendingGdprRequests: number
}

export default function SecurityDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [securityStats, setSecurityStats] = useState<SecurityStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
    loadSecurityStats()
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      loadDashboardData()
      loadSecurityStats()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/security/dashboard')
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data.dashboard)
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    }
  }

  const loadSecurityStats = async () => {
    try {
      const [eventsRes, alertsRes, apiKeysRes] = await Promise.all([
        fetch('/api/security/events?limit=1'),
        fetch('/api/security/alerts'),
        fetch('/api/security/api-keys')
      ])

      const events = eventsRes.ok ? await eventsRes.json() : { pagination: { total: 0 } }
      const alerts = alertsRes.ok ? await alertsRes.json() : { statistics: { total: 0 } }
      const apiKeys = apiKeysRes.ok ? await apiKeysRes.json() : { total: 0 }

      setSecurityStats({
        totalEvents: events.pagination?.total || 0,
        criticalAlerts: alerts.alerts?.filter((a: any) => a.severity === 'CRITICAL' && !a.acknowledged).length || 0,
        activeApiKeys: apiKeys.apiKeys?.filter((k: any) => k.isActive).length || 0,
        activeSessions: 0, // We'll implement this later
        pendingGdprRequests: 0 // We'll implement this later
      })
    } catch (error) {
      console.error('Failed to load security stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const runSecurityCheck = async () => {
    try {
      const response = await fetch('/api/security/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        toast.success('Security threshold check completed')
        loadDashboardData()
        loadSecurityStats()
      } else {
        toast.error('Failed to run security check')
      }
    } catch (error) {
      toast.error('Security check failed')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats?.totalEvents || 0}</div>
            <p className="text-xs text-muted-foreground">Total events logged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{securityStats?.criticalAlerts || 0}</div>
            <p className="text-xs text-muted-foreground">Unacknowledged alerts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active API Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats?.activeApiKeys || 0}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats?.activeSessions || 0}</div>
            <p className="text-xs text-muted-foreground">Current sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GDPR Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats?.pendingGdprRequests || 0}</div>
            <p className="text-xs text-muted-foreground">Pending requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Quick Security Actions
          </CardTitle>
          <CardDescription>
            Perform common security operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button onClick={runSecurityCheck} variant="outline">
              <AlertCircle className="h-4 w-4 mr-2" />
              Run Security Check
            </Button>
            <Button variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Clean Old Sessions
            </Button>
            <Button variant="outline">
              <Clock className="h-4 w-4 mr-2" />
              Apply Data Retention
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      {dashboardData?.recentEvents && dashboardData.recentEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Security Events</CardTitle>
            <CardDescription>
              Latest security events from the past 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.recentEvents.slice(0, 5).map((event: any) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={event.severity === 'CRITICAL' ? 'destructive' : 
                              event.severity === 'HIGH' ? 'destructive' :
                              event.severity === 'MEDIUM' ? 'default' : 'secondary'}
                    >
                      {event.severity}
                    </Badge>
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{event.source}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Management Tabs */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="files">File Security</TabsTrigger>
          <TabsTrigger value="gdpr">GDPR</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <SecurityEvents />
        </TabsContent>

        <TabsContent value="alerts">
          <SecurityAlerts />
        </TabsContent>

        <TabsContent value="api-keys">
          <ApiKeyManager />
        </TabsContent>

        <TabsContent value="files">
          <FileUploader />
        </TabsContent>

        <TabsContent value="gdpr">
          <GdprManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Eye, 
  Lock,
  Clock,
  Globe,
  Users,
  Activity,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'

interface SecurityDashboardData {
  overview: {
    activeThreatCount: number
    activeIncidentCount: number
    activeAlertCount: number
    complianceScore: number
  }
  threats: {
    recent: any[]
    byType: any[]
    bySeverity: any[]
  }
  ipIntelligence: any[]
  bruteForce: {
    totalAttempts: number
    uniqueIps: number
  }
  incidents: any[]
  alerts: any[]
  metrics: any
  compliance: any
}

const COLORS = ['#60B5FF', '#FF9149', '#FF9898', '#FF90BB', '#FF6363', '#80D8C3', '#A19AD3', '#72BF78']

const severityColors = {
  LOW: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800'
}

export function SecurityDashboard() {
  const [dashboardData, setDashboardData] = useState<SecurityDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/security/dashboard')
      if (!response.ok) throw new Error('Failed to fetch dashboard data')
      const data = await response.json()
      setDashboardData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!dashboardData) return null

  const { overview, threats, ipIntelligence, bruteForce, incidents, alerts, metrics, compliance } = dashboardData

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overview.activeThreatCount}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{overview.activeIncidentCount}</div>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{overview.activeAlertCount}</div>
            <p className="text-xs text-muted-foreground">Unacknowledged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overview.complianceScore}%</div>
            <Progress value={overview.complianceScore} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="threats" className="space-y-4">
        <TabsList>
          <TabsTrigger value="threats">Threat Analysis</TabsTrigger>
          <TabsTrigger value="incidents">Incident Response</TabsTrigger>
          <TabsTrigger value="monitoring">Real-time Monitoring</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="threats" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Threats by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Threats by Type (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={threats.byType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="_count"
                      nameKey="type"
                    >
                      {threats.byType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Threats by Severity */}
            <Card>
              <CardHeader>
                <CardTitle>Threats by Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={threats.bySeverity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="severity" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="_count" fill="#60B5FF" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Threats */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Threats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threats.recent?.slice(0, 5)?.map((threat: any) => (
                  <div key={threat.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {threat.severity === 'CRITICAL' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                        {threat.severity === 'HIGH' && <AlertCircle className="h-5 w-5 text-orange-500" />}
                        {threat.severity === 'MEDIUM' && <Eye className="h-5 w-5 text-yellow-500" />}
                        {threat.severity === 'LOW' && <Shield className="h-5 w-5 text-blue-500" />}
                      </div>
                      <div>
                        <p className="font-medium">{threat.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {threat.type} • {new Date(threat.firstDetected).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={severityColors[threat.severity as keyof typeof severityColors]}>
                        {threat.severity}
                      </Badge>
                      <Badge variant="outline">Risk: {threat.riskScore}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* IP Intelligence Summary */}
          <Card>
            <CardHeader>
              <CardTitle>IP Intelligence Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {ipIntelligence?.map((intel: any) => (
                  <div key={intel.reputation} className="text-center">
                    <div className="text-2xl font-bold">{intel._count}</div>
                    <div className="text-sm text-muted-foreground">{intel.reputation}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Brute Force Attempts:</span> {bruteForce.totalAttempts}
                  </div>
                  <div>
                    <span className="font-medium">Unique Source IPs:</span> {bruteForce.uniqueIps}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incidents?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                    No active incidents
                  </div>
                ) : (
                  incidents?.map((incident: any) => (
                    <div key={incident.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{incident.title}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant={incident.priority === 'CRITICAL' ? 'destructive' : 'secondary'}>
                            {incident.priority}
                          </Badge>
                          <Badge variant="outline">{incident.status}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{incident.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Created: {new Date(incident.createdAt).toLocaleString()}</span>
                        <span>Response: {incident.responseType}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          {/* Security Metrics Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Security Metrics (Last 24 Hours)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={Object.values(metrics?.attack_attempts || {})}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleTimeString()} />
                  <YAxis />
                  <Tooltip labelFormatter={(value) => new Date(value).toLocaleString()} />
                  <Line type="monotone" dataKey="value" stroke="#60B5FF" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Active Security Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Active Security Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-8 w-8 mx-auto mb-2" />
                    No active alerts
                  </div>
                ) : (
                  alerts?.map((alert: any) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{alert.title}</p>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={severityColors[alert.severity as keyof typeof severityColors]}>
                          {alert.severity}
                        </Badge>
                        <Button size="sm" variant="outline">
                          Acknowledge
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Overall Score</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={compliance?.overallScore || 0} className="w-20" />
                    <span className="font-medium">{compliance?.overallScore || 0}%</span>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="text-sm">Pending GDPR Requests</span>
                    <Badge variant={compliance?.pendingGdprRequests > 0 ? "destructive" : "secondary"}>
                      {compliance?.pendingGdprRequests || 0}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Audit Log Coverage</span>
                    <Badge variant="secondary">{compliance?.auditLogCount || 0} entries</Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Data Classifications</span>
                    <Badge variant="secondary">{compliance?.classifiedDataCount || 0} items</Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Approved PIAs</span>
                    <Badge variant="secondary">{compliance?.approvedPiaCount || 0} assessments</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Compliance Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Compliance Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2" />
                    <p>Compliance activity log will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* GDPR Request Processing */}
          <Card>
            <CardHeader>
              <CardTitle>Data Processing Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2" />
                <p>GDPR request management interface</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  FileText, 
  Mail,
  Phone,
  Target,
  BarChart3,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { DashboardStats } from '@/lib/types'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface MetricCard {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
}

export function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [conversionData, setConversionData] = useState<any[]>([])
  const [leadSourceData, setLeadSourceData] = useState<any[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      const data = await response.json()
      setStats(data.stats)
      setConversionData(data.conversionData)
      setLeadSourceData(data.leadSourceData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const metricCards: MetricCard[] = [
    {
      title: 'Totaal Leads',
      value: stats?.totalLeads?.toString() || '0',
      change: '+12%',
      changeType: 'positive',
      icon: <Users className="h-4 w-4" />
    },
    {
      title: 'Gekwalificeerde Leads',
      value: stats?.qualifiedLeads?.toString() || '0',
      change: '+8%',
      changeType: 'positive',
      icon: <Target className="h-4 w-4" />
    },
    {
      title: 'Conversie Rate',
      value: `${stats?.conversionRate || 0}%`,
      change: '+2.1%',
      changeType: 'positive',
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      title: 'QuickScans',
      value: stats?.quickScansCompleted?.toString() || '0',
      change: '+15%',
      changeType: 'positive',
      icon: <FileText className="h-4 w-4" />
    },
    {
      title: 'Chat Gesprekken',
      value: stats?.chatConversations?.toString() || '0',
      change: '+25%',
      changeType: 'positive',
      icon: <MessageSquare className="h-4 w-4" />
    },
    {
      title: 'Actieve Klanten',
      value: stats?.activeCustomers?.toString() || '0',
      change: '+3%',
      changeType: 'positive',
      icon: <Users className="h-4 w-4" />
    }
  ]

  const COLORS = ['#60B5FF', '#FF9149', '#FF9898', '#FF90BB', '#80D8C3', '#A19AD3']

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map((metric, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <div className="p-2 bg-blue-100 rounded-full">
                {metric.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {metric.changeType === 'positive' ? (
                  <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={metric.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}>
                  {metric.change}
                </span>
                <span className="ml-1">vs vorige periode</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Conversie Trend</CardTitle>
            <CardDescription>Conversie rate over de afgelopen 30 dagen</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="conversionRate"
                  stroke="#60B5FF"
                  fill="#60B5FF"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Bronnen</CardTitle>
            <CardDescription>Verdeling van lead bronnen deze maand</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={leadSourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {leadSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>Belangrijkste inzichten en aanbevelingen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Positief
                </Badge>
                <span className="text-sm">Chatbot conversie rate gestegen met 25%</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  Trending
                </Badge>
                <span className="text-sm">QuickScan populair bij middelgrote bedrijven</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  Aandacht
                </Badge>
                <span className="text-sm">Follow-up tijd kan worden verbeterd</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  Kans
                </Badge>
                <span className="text-sm">LinkedIn als lead bron uitbreiden</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

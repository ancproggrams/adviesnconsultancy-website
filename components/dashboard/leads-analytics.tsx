
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Search,
  Filter,
  Star,
  Mail,
  Phone,
  Building,
  Calendar,
  TrendingUp,
  Users,
  Target
} from 'lucide-react'
import { CrmContact } from '@/lib/types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export function LeadsAnalytics() {
  const [leads, setLeads] = useState<CrmContact[]>([])
  const [filteredLeads, setFilteredLeads] = useState<CrmContact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [leadScoreData, setLeadScoreData] = useState<any[]>([])
  const [leadTrendData, setLeadTrendData] = useState<any[]>([])

  useEffect(() => {
    fetchLeadsData()
  }, [])

  useEffect(() => {
    filterLeads()
  }, [leads, searchTerm, filterStatus])

  const fetchLeadsData = async () => {
    try {
      const response = await fetch('/api/dashboard/leads')
      const data = await response.json()
      setLeads(data.leads)
      setLeadScoreData(data.leadScoreData)
      setLeadTrendData(data.leadTrendData)
    } catch (error) {
      console.error('Error fetching leads data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterLeads = () => {
    let filtered = leads

    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(lead => lead.lifecycleStage === filterStatus)
    }

    setFilteredLeads(filtered)
  }

  const getLeadScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-700">Hoge Kwaliteit</Badge>
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-700">Gemiddeld</Badge>
    if (score >= 40) return <Badge className="bg-orange-100 text-orange-700">Laag</Badge>
    return <Badge variant="secondary">Zeer Laag</Badge>
  }

  const getLeadSourceBadge = (source: string) => {
    const badges = {
      'chatbot': <Badge className="bg-blue-100 text-blue-700">Chatbot</Badge>,
      'quickscan': <Badge className="bg-purple-100 text-purple-700">QuickScan</Badge>,
      'contact_form': <Badge className="bg-green-100 text-green-700">Contact Form</Badge>,
      'newsletter': <Badge className="bg-orange-100 text-orange-700">Newsletter</Badge>,
      'linkedin': <Badge className="bg-blue-100 text-blue-700">LinkedIn</Badge>,
      'website': <Badge variant="secondary">Website</Badge>
    }
    return badges[source as keyof typeof badges] || <Badge variant="secondary">{source}</Badge>
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
    <div className="space-y-6">
      {/* Lead Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Totaal Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
            <div className="text-xs text-muted-foreground">+12% deze maand</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hoge Kwaliteit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.filter(lead => lead.leadScore >= 80).length}
            </div>
            <div className="text-xs text-muted-foreground">Score ≥ 80</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gemiddelde Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.length > 0 ? Math.round(leads.reduce((sum, lead) => sum + lead.leadScore, 0) / leads.length) : 0}
            </div>
            <div className="text-xs text-muted-foreground">Lead score</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Deze Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.filter(lead => {
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return new Date(lead.createdAt) > weekAgo
              }).length}
            </div>
            <div className="text-xs text-muted-foreground">Nieuwe leads</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lead Score Verdeling</CardTitle>
            <CardDescription>Verdeling van lead scores</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={leadScoreData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#60B5FF" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lead Trend</CardTitle>
            <CardDescription>Nieuwe leads over tijd</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={leadTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke="#60B5FF"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leads Overzicht</CardTitle>
          <CardDescription>Gedetailleerd overzicht van alle leads</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Zoek leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="subscriber">Subscriber</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="marketingqualifiedlead">Marketing Qualified</SelectItem>
                <SelectItem value="salesqualifiedlead">Sales Qualified</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Bedrijf</TableHead>
                <TableHead>Lead Score</TableHead>
                <TableHead>Bron</TableHead>
                <TableHead>Laatste Activiteit</TableHead>
                <TableHead>Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {lead.firstName[0]}{lead.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{lead.firstName} {lead.lastName}</div>
                        <div className="text-sm text-muted-foreground">{lead.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      {lead.company || 'Niet opgegeven'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{lead.leadScore}</span>
                      {getLeadScoreBadge(lead.leadScore)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getLeadSourceBadge(lead.leadSource || 'website')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {lead.lastActivity ? new Date(lead.lastActivity).toLocaleDateString('nl-NL') : 'Nooit'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

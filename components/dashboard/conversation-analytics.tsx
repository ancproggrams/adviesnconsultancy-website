
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  MessageSquare,
  Clock,
  Users,
  TrendingUp,
  Bot,
  Star,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'
import { ChatConversation } from '@/lib/types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export function ConversationAnalytics() {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [conversationStats, setConversationStats] = useState<any>({})
  const [hourlyData, setHourlyData] = useState<any[]>([])

  useEffect(() => {
    fetchConversationData()
  }, [])

  const fetchConversationData = async () => {
    try {
      const response = await fetch('/api/dashboard/conversations')
      const data = await response.json()
      setConversations(data.conversations)
      setConversationStats(data.stats)
      setHourlyData(data.hourlyData)
    } catch (error) {
      console.error('Error fetching conversation data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      'ACTIVE': <Badge className="bg-blue-100 text-blue-700">Actief</Badge>,
      'QUALIFIED': <Badge className="bg-green-100 text-green-700">Gekwalificeerd</Badge>,
      'CONVERTED': <Badge className="bg-purple-100 text-purple-700">Geconverteerd</Badge>,
      'ARCHIVED': <Badge variant="secondary">Gearchiveerd</Badge>
    }
    return badges[status as keyof typeof badges] || <Badge variant="secondary">{status}</Badge>
  }

  const formatDuration = (start: string, end: string) => {
    const duration = new Date(end).getTime() - new Date(start).getTime()
    const minutes = Math.floor(duration / 60000)
    const seconds = Math.floor((duration % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
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
      {/* Conversation Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Totaal Gesprekken</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversationStats.total || 0}</div>
            <div className="text-xs text-muted-foreground">+{conversationStats.growthRate || 0}% deze maand</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gekwalificeerd</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversationStats.qualified || 0}</div>
            <div className="text-xs text-muted-foreground">
              {conversationStats.qualificationRate || 0}% conversie rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gem. Gespreksduur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversationStats.averageDuration || '0m'}</div>
            <div className="text-xs text-muted-foreground">Per gesprek</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tevredenheidscore</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversationStats.satisfactionScore || 0}%</div>
            <div className="text-xs text-muted-foreground">Gebruikerstevredenheid</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Gesprekken per Uur</CardTitle>
            <CardDescription>Verdeling van gesprekken gedurende de dag</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="conversations" fill="#60B5FF" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversie Trend</CardTitle>
            <CardDescription>Conversie van gesprekken naar leads</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={conversationStats.conversionTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="conversionRate"
                  stroke="#60B5FF"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Conversations */}
      <Card>
        <CardHeader>
          <CardTitle>Recente Gesprekken</CardTitle>
          <CardDescription>Overzicht van de laatste chatbot gesprekken</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gebruiker</TableHead>
                <TableHead>Berichten</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Lead Score</TableHead>
                <TableHead>Gestart</TableHead>
                <TableHead>Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversations.map((conversation) => (
                <TableRow key={conversation.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Bot className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {conversation.userName || 'Anonieme gebruiker'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {conversation.userEmail || 'Email niet opgegeven'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span>{conversation.messages?.length || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(conversation.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{conversation.leadScore}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(conversation.createdAt).toLocaleString('nl-NL')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        Bekijk
                      </Button>
                      {conversation.userEmail && (
                        <Button size="sm" variant="outline">
                          Contact
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Popular Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Populaire Vragen</CardTitle>
          <CardDescription>Meest gestelde vragen aan de chatbot</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { question: 'Wat is ISO 22301 compliance?', count: 45, trend: 'up' },
              { question: 'Hoe lang duurt een BCM implementatie?', count: 32, trend: 'up' },
              { question: 'Wat kost een compliance audit?', count: 28, trend: 'stable' },
              { question: 'Kan ik de QuickScan opnieuw doen?', count: 24, trend: 'down' },
              { question: 'Welke bedrijven hebben jullie geholpen?', count: 18, trend: 'up' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{item.question}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.count} keer gevraagd
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                  {item.trend === 'down' && <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />}
                  <Badge variant="secondary">{item.count}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

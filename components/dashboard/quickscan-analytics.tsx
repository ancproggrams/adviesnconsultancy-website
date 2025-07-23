
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  FileText,
  TrendingUp,
  Award,
  Building,
  Download,
  Star,
  Calendar,
  Mail,
  Phone
} from 'lucide-react'
import { QuickScanResults } from '@/lib/types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

export function QuickScanAnalytics() {
  const [quickScans, setQuickScans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [scanStats, setScanStats] = useState<any>({})
  const [maturityData, setMaturityData] = useState<any[]>([])
  const [trendData, setTrendData] = useState<any[]>([])

  useEffect(() => {
    fetchQuickScanData()
  }, [])

  const fetchQuickScanData = async () => {
    try {
      const response = await fetch('/api/dashboard/quickscans')
      const data = await response.json()
      setQuickScans(data.quickScans)
      setScanStats(data.stats)
      setMaturityData(data.maturityData)
      setTrendData(data.trendData)
    } catch (error) {
      console.error('Error fetching QuickScan data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMaturityBadge = (level: string) => {
    const badges = {
      'Basic': <Badge className="bg-red-100 text-red-700">Basis</Badge>,
      'Developing': <Badge className="bg-orange-100 text-orange-700">Ontwikkelend</Badge>,
      'Advanced': <Badge className="bg-blue-100 text-blue-700">Gevorderd</Badge>,
      'Expert': <Badge className="bg-green-100 text-green-700">Expert</Badge>
    }
    return badges[level as keyof typeof badges] || <Badge variant="secondary">{level}</Badge>
  }

  const COLORS = ['#FF6B6B', '#FFB347', '#60B5FF', '#4ECDC4']

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
      {/* QuickScan Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Totaal Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scanStats.total || 0}</div>
            <div className="text-xs text-muted-foreground">+{scanStats.growthRate || 0}% deze maand</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gemiddelde Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scanStats.averageScore || 0}</div>
            <div className="text-xs text-muted-foreground">Van 5 punten</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rapporten Gegenereerd</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scanStats.reportsGenerated || 0}</div>
            <div className="text-xs text-muted-foreground">
              {scanStats.reportGenerationRate || 0}% van scans
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Consultaties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scanStats.consultationsRequested || 0}</div>
            <div className="text-xs text-muted-foreground">
              {scanStats.consultationRate || 0}% conversie
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Volwassenheid Verdeling</CardTitle>
            <CardDescription>Verdeling van BCM volwassenheid niveaus</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={maturityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {maturityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scan Trend</CardTitle>
            <CardDescription>Aantal QuickScans over tijd</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="scans"
                  stroke="#60B5FF"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Score Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Score Verdeling per Controlegebied</CardTitle>
          <CardDescription>Gemiddelde scores per ISO 22301 controlegebied</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={scanStats.controlAreaScores || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="area" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="averageScore" fill="#60B5FF" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent QuickScans */}
      <Card>
        <CardHeader>
          <CardTitle>Recente QuickScans</CardTitle>
          <CardDescription>Overzicht van de laatste uitgevoerde scans</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deelnemer</TableHead>
                <TableHead>Bedrijf</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Volwassenheid</TableHead>
                <TableHead>Rapport</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quickScans.map((scan) => (
                <TableRow key={scan.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <FileText className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">{scan.name}</div>
                        <div className="text-sm text-muted-foreground">{scan.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      {scan.company}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{scan.overallScore}/5</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getMaturityBadge(scan.maturityLevel)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {scan.reportGenerated ? (
                        <Badge className="bg-green-100 text-green-700">Gegenereerd</Badge>
                      ) : (
                        <Badge variant="secondary">Nog niet</Badge>
                      )}
                      {scan.reportUrl && (
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(scan.createdAt).toLocaleDateString('nl-NL')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4" />
                      </Button>
                      {scan.phone && (
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4" />
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
    </div>
  )
}

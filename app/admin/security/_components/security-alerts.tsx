
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface SecurityAlert {
  id: string
  type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  title: string
  message: string
  metadata?: any
  triggered: boolean
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: string
  createdAt: string
}

export default function SecurityAlerts() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [showAcknowledged, setShowAcknowledged] = useState(false)

  useEffect(() => {
    loadAlerts()
  }, [showAcknowledged])

  const loadAlerts = async () => {
    try {
      const params = new URLSearchParams({
        includeAcknowledged: showAcknowledged.toString()
      })

      const response = await fetch(`/api/security/alerts?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.alerts)
      }
    } catch (error) {
      toast.error('Failed to load security alerts')
    } finally {
      setLoading(false)
    }
  }

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/security/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId })
      })

      if (response.ok) {
        toast.success('Alert acknowledged successfully')
        loadAlerts()
      } else {
        toast.error('Failed to acknowledge alert')
      }
    } catch (error) {
      toast.error('Failed to acknowledge alert')
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'HIGH':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case 'MEDIUM':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'LOW':
        return <AlertCircle className="h-5 w-5 text-blue-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'border-red-500 bg-red-50'
      case 'HIGH':
        return 'border-orange-500 bg-orange-50'
      case 'MEDIUM':
        return 'border-yellow-500 bg-yellow-50'
      case 'LOW':
        return 'border-blue-500 bg-blue-50'
      default:
        return 'border-gray-500 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Security Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged)
  const acknowledgedAlerts = alerts.filter(alert => alert.acknowledged)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Security Alerts</CardTitle>
            <CardDescription>
              Real-time security alerts and notifications
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive">
              {unacknowledgedAlerts.length} Unacknowledged
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAcknowledged(!showAcknowledged)}
            >
              {showAcknowledged ? 'Hide' : 'Show'} Acknowledged
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Unacknowledged Alerts */}
          {unacknowledgedAlerts.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3 text-red-600">
                🚨 Unacknowledged Alerts ({unacknowledgedAlerts.length})
              </h3>
              <div className="space-y-3">
                {unacknowledgedAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 border-l-4 rounded-lg ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium">{alert.title}</h4>
                            <Badge
                              variant={
                                alert.severity === 'CRITICAL' ? 'destructive' :
                                alert.severity === 'HIGH' ? 'destructive' :
                                alert.severity === 'MEDIUM' ? 'default' : 'secondary'
                              }
                            >
                              {alert.severity}
                            </Badge>
                            <Badge variant="outline">{alert.type}</Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                          <p className="text-xs text-gray-500">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {new Date(alert.createdAt).toLocaleString()}
                          </p>
                          {alert.metadata && (
                            <details className="mt-2">
                              <summary className="text-xs text-blue-600 cursor-pointer">
                                View Details
                              </summary>
                              <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto border">
                                {JSON.stringify(alert.metadata, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="ml-4"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Acknowledge
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Acknowledged Alerts */}
          {showAcknowledged && acknowledgedAlerts.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3 text-green-600">
                ✅ Acknowledged Alerts ({acknowledgedAlerts.length})
              </h3>
              <div className="space-y-3">
                {acknowledgedAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 border rounded-lg bg-gray-50 opacity-75"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{alert.title}</h4>
                          <Badge variant="outline">{alert.severity}</Badge>
                          <Badge variant="outline">{alert.type}</Badge>
                          <Badge variant="outline" className="text-green-600">
                            Acknowledged
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                        <div className="text-xs text-gray-500">
                          <p>
                            <Clock className="h-3 w-3 inline mr-1" />
                            Created: {new Date(alert.createdAt).toLocaleString()}
                          </p>
                          {alert.acknowledgedAt && (
                            <p>
                              <CheckCircle className="h-3 w-3 inline mr-1" />
                              Acknowledged: {new Date(alert.acknowledgedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Alerts */}
          {alerts.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h3>
              <p className="text-gray-600">
                No security alerts at this time. Your system is secure.
              </p>
            </div>
          )}

          {/* Only acknowledged alerts and none unacknowledged */}
          {unacknowledgedAlerts.length === 0 && acknowledgedAlerts.length > 0 && !showAcknowledged && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Alerts Resolved!</h3>
              <p className="text-gray-600">
                All security alerts have been acknowledged. Click "Show Acknowledged" to view resolved alerts.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell, 
  Shield, 
  AlertTriangle, 
  Check, 
  X, 
  Settings,
  Clock,
  ExternalLink,
  Mail,
  Smartphone
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface SecurityNotification {
  id: string
  type: string
  title: string
  message: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  isRead: boolean
  readAt?: string
  actionUrl?: string
  metadata?: any
  createdAt: string
}

interface SecurityPreferences {
  twoFactorEnabled: boolean
  securityNotifications: boolean
  loginNotifications: boolean
  unusualActivityAlerts: boolean
  passwordChangeReminders: boolean
  securityDigestFreq: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  sessionTimeout: number
}

interface SecurityNotificationsProps {
  userId: string
  userType: 'admin' | 'customer'
}

const severityIcons = {
  LOW: <Bell className="h-4 w-4 text-blue-500" />,
  MEDIUM: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  HIGH: <Shield className="h-4 w-4 text-orange-500" />,
  CRITICAL: <AlertTriangle className="h-4 w-4 text-red-500" />
}

const severityColors = {
  LOW: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800'
}

export function SecurityNotifications({ userId, userType }: SecurityNotificationsProps) {
  const [notifications, setNotifications] = useState<SecurityNotification[]>([])
  const [preferences, setPreferences] = useState<SecurityPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('notifications')

  useEffect(() => {
    fetchNotifications()
    fetchPreferences()
  }, [userId, userType])

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/security/notifications?userId=${userId}&userType=${userType}`)
      if (!response.ok) throw new Error('Failed to fetch notifications')
      const data = await response.json()
      setNotifications(data.notifications || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications')
    }
  }

  const fetchPreferences = async () => {
    try {
      const response = await fetch(`/api/security/preferences?userId=${userId}&userType=${userType}`)
      if (!response.ok) throw new Error('Failed to fetch preferences')
      const data = await response.json()
      setPreferences(data.preferences || getDefaultPreferences())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences')
    } finally {
      setLoading(false)
    }
  }

  const getDefaultPreferences = (): SecurityPreferences => ({
    twoFactorEnabled: false,
    securityNotifications: true,
    loginNotifications: true,
    unusualActivityAlerts: true,
    passwordChangeReminders: true,
    securityDigestFreq: 'WEEKLY',
    sessionTimeout: 120
  })

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/security/notifications/${notificationId}/read`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to mark notification as read')
      
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notification')
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/security/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userType })
      })
      if (!response.ok) throw new Error('Failed to mark all as read')
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notifications')
    }
  }

  const updatePreferences = async (newPreferences: Partial<SecurityPreferences>) => {
    setUpdating(true)
    try {
      const updatedPrefs = { ...preferences, ...newPreferences } as SecurityPreferences
      
      const response = await fetch('/api/security/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userType, preferences: updatedPrefs })
      })
      
      if (!response.ok) throw new Error('Failed to update preferences')
      
      setPreferences(updatedPrefs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences')
    } finally {
      setUpdating(false)
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="notifications" className="relative">
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Settings className="h-4 w-4 mr-2" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Security Notifications</CardTitle>
                <CardDescription>
                  Stay informed about security events and activities on your account
                </CardDescription>
              </div>
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  Mark All Read ({unreadCount})
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No security notifications</p>
                    <p className="text-sm">You're all caught up!</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border rounded-lg transition-colors ${
                        !notification.isRead ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {severityIcons[notification.severity]}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium">{notification.title}</h4>
                              <Badge className={severityColors[notification.severity]}>
                                {notification.severity}
                              </Badge>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDistanceToNow(new Date(notification.createdAt))} ago
                              </span>
                              {notification.actionUrl && (
                                <a
                                  href={notification.actionUrl}
                                  className="flex items-center hover:text-blue-600"
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  View Details
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                        {!notification.isRead && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          {preferences && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Security Notification Preferences</CardTitle>
                  <CardDescription>
                    Configure how and when you receive security notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Security Notifications</Label>
                        <div className="text-sm text-muted-foreground">
                          Receive notifications about security events
                        </div>
                      </div>
                      <Switch
                        checked={preferences.securityNotifications}
                        onCheckedChange={(checked) => 
                          updatePreferences({ securityNotifications: checked })
                        }
                        disabled={updating}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Login Notifications</Label>
                        <div className="text-sm text-muted-foreground">
                          Get notified when someone logs into your account
                        </div>
                      </div>
                      <Switch
                        checked={preferences.loginNotifications}
                        onCheckedChange={(checked) => 
                          updatePreferences({ loginNotifications: checked })
                        }
                        disabled={updating}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Unusual Activity Alerts</Label>
                        <div className="text-sm text-muted-foreground">
                          Receive alerts about suspicious account activity
                        </div>
                      </div>
                      <Switch
                        checked={preferences.unusualActivityAlerts}
                        onCheckedChange={(checked) => 
                          updatePreferences({ unusualActivityAlerts: checked })
                        }
                        disabled={updating}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Password Change Reminders</Label>
                        <div className="text-sm text-muted-foreground">
                          Get reminded to update your password periodically
                        </div>
                      </div>
                      <Switch
                        checked={preferences.passwordChangeReminders}
                        onCheckedChange={(checked) => 
                          updatePreferences({ passwordChangeReminders: checked })
                        }
                        disabled={updating}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Digest</CardTitle>
                  <CardDescription>
                    Receive periodic summaries of your account security status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Digest Frequency</Label>
                      <div className="mt-2 space-y-2">
                        {(['DAILY', 'WEEKLY', 'MONTHLY'] as const).map((freq) => (
                          <label key={freq} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="digestFreq"
                              value={freq}
                              checked={preferences.securityDigestFreq === freq}
                              onChange={(e) => 
                                updatePreferences({ securityDigestFreq: e.target.value as any })
                              }
                              disabled={updating}
                            />
                            <span className="text-sm capitalize">{freq.toLowerCase()}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

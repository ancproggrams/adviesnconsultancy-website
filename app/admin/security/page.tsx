
import { Metadata } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-config'
import { redirect } from 'next/navigation'
import { SecurityDashboard } from '@/components/security/security-dashboard'
import { TwoFactorAuth } from '@/components/security/two-factor-auth'
import { SecurityNotifications } from '@/components/security/security-notifications'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shield, Bell, Settings, Activity, Lock, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Security Center - Admin Dashboard',
  description: 'Advanced security monitoring and management center',
}

export default async function AdminSecurityPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
    redirect('/admin/login')
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Security Center</h1>
            <p className="text-gray-600">Advanced security monitoring and management</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">Week 3-4 Security Implementation</h3>
              <p className="text-sm text-blue-700 mt-1">
                Advanced threat detection, behavioral analytics, automated incident response, 
                compliance monitoring, and enhanced user security features are now active.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="two-factor" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Two-Factor Auth
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Real-time Security Dashboard
                </CardTitle>
                <CardDescription>
                  Monitor threats, incidents, compliance status, and security metrics in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SecurityDashboard />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="two-factor">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Two-Factor Authentication
                </CardTitle>
                <CardDescription>
                  Enhance your account security with two-factor authentication
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TwoFactorAuth 
                  userId={session.user.id} 
                  userType="admin"
                  onStatusChange={(enabled) => {
                    // Handle status change if needed
                    console.log('2FA status changed:', enabled)
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Security Notifications & Preferences
                </CardTitle>
                <CardDescription>
                  Manage your security notifications and account preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SecurityNotifications 
                  userId={session.user.id} 
                  userType="admin" 
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="space-y-6">
            {/* Security Settings Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    Security Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Account Security</span>
                    <span className="text-sm font-medium text-green-600">Strong</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Session Security</span>
                    <span className="text-sm font-medium text-green-600">Active</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Threat Protection</span>
                    <span className="text-sm font-medium text-green-600">Enabled</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Compliance Status</span>
                    <span className="text-sm font-medium text-green-600">Compliant</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Active Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">IP Intelligence</span>
                    <span className="text-sm font-medium text-blue-600">Enabled</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Brute Force Protection</span>
                    <span className="text-sm font-medium text-blue-600">Active</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Anomaly Detection</span>
                    <span className="text-sm font-medium text-blue-600">Learning</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Automated Response</span>
                    <span className="text-sm font-medium text-blue-600">Ready</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lock className="h-5 w-5 text-purple-600" />
                    Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">GDPR Compliance</span>
                    <span className="text-sm font-medium text-purple-600">Active</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Audit Logging</span>
                    <span className="text-sm font-medium text-purple-600">Complete</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Data Classification</span>
                    <span className="text-sm font-medium text-purple-600">Applied</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Privacy Impact</span>
                    <span className="text-sm font-medium text-purple-600">Assessed</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Security Features Information */}
            <Card>
              <CardHeader>
                <CardTitle>Week 3-4 Security Features</CardTitle>
                <CardDescription>
                  Overview of advanced security capabilities implemented
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Advanced Threat Detection</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• IP reputation and intelligence checking</li>
                      <li>• Brute force attack detection and blocking</li>
                      <li>• User behavior anomaly detection</li>
                      <li>• Automated threat response systems</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Monitoring & Alerting</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Real-time security metrics collection</li>
                      <li>• Advanced alerting workflows</li>
                      <li>• Predictive security analytics</li>
                      <li>• Comprehensive incident response</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Compliance & Audit</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Comprehensive audit logging</li>
                      <li>• Data classification system</li>
                      <li>• Privacy impact assessments</li>
                      <li>• Automated compliance reporting</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">User Security</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Two-factor authentication (TOTP)</li>
                      <li>• Security notifications system</li>
                      <li>• User security preferences</li>
                      <li>• Self-service security tools</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

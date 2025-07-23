
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QRCodeSVG } from 'qrcode.react'
import { Shield, Copy, Check, Key, AlertTriangle, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface TwoFactorAuthProps {
  userId: string
  userType: 'admin' | 'customer'
  isEnabled?: boolean
  onStatusChange?: (enabled: boolean) => void
}

export function TwoFactorAuth({ userId, userType, isEnabled = false, onStatusChange }: TwoFactorAuthProps) {
  const [loading, setLoading] = useState(false)
  const [setupData, setSetupData] = useState<{ secret: string; qrCode: string } | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [showSetup, setShowSetup] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<Record<string, boolean>>({})

  const setupTOTP = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/security/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userType })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Setup failed')
      }

      const data = await response.json()
      setSetupData(data)
      setShowSetup(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed')
    } finally {
      setLoading(false)
    }
  }

  const verifyTOTP = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter a verification code')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/security/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userType, token: verificationCode })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Verification failed')
      }

      const data = await response.json()
      setBackupCodes(data.backupCodes)
      onStatusChange?.(true)
      toast.success('Two-factor authentication enabled successfully!')
      setShowSetup(false)
      setVerificationCode('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const disable2FA = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication? This will reduce your account security.')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/security/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userType })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to disable 2FA')
      }

      onStatusChange?.(false)
      toast.success('Two-factor authentication disabled')
      setBackupCodes([])
      setSetupData(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable 2FA')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(prev => ({ ...prev, [key]: true }))
      setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 2000)
      toast.success('Copied to clipboard')
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const generateNewBackupCodes = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/security/2fa/backup-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userType })
      })

      if (!response.ok) throw new Error('Failed to generate backup codes')

      const data = await response.json()
      setBackupCodes(data.backupCodes)
      toast.success('New backup codes generated')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate backup codes')
    } finally {
      setLoading(false)
    }
  }

  if (!isEnabled && !showSetup) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account with two-factor authentication (2FA).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Disabled</Badge>
            <span className="text-sm text-muted-foreground">
              Your account is less secure without 2FA
            </span>
          </div>

          <Button onClick={setupTOTP} disabled={loading}>
            {loading ? 'Setting up...' : 'Enable Two-Factor Authentication'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (showSetup && setupData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Setup Two-Factor Authentication</CardTitle>
          <CardDescription>
            Scan the QR code with your authenticator app, then enter the verification code.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="qr" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="qr">QR Code</TabsTrigger>
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            </TabsList>
            
            <TabsContent value="qr" className="space-y-4">
              <div className="flex justify-center">
                <div className="p-4 border rounded-lg bg-white">
                  <QRCodeSVG value={setupData.qrCode} size={200} />
                </div>
              </div>
              <p className="text-sm text-center text-muted-foreground">
                Scan this QR code with Google Authenticator, Authy, or another TOTP app
              </p>
            </TabsContent>
            
            <TabsContent value="manual" className="space-y-4">
              <div>
                <Label>Secret Key</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={setupData.secret} readOnly className="font-mono text-sm" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(setupData.secret, 'secret')}
                  >
                    {copied.secret ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter this secret key manually in your authenticator app
              </p>
            </TabsContent>
          </Tabs>

          <div className="space-y-4">
            <div>
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-lg font-mono"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={verifyTOTP} disabled={loading || verificationCode.length !== 6}>
                {loading ? 'Verifying...' : 'Verify & Enable'}
              </Button>
              <Button variant="outline" onClick={() => setShowSetup(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Two-factor authentication is enabled for your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Check className="h-3 w-3 mr-1" />
            Enabled
          </Badge>
          <span className="text-sm text-muted-foreground">
            Your account is protected with 2FA
          </span>
        </div>

        {backupCodes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Backup Codes</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={generateNewBackupCodes}
                disabled={loading}
              >
                <Key className="h-4 w-4 mr-2" />
                Generate New Codes
              </Button>
            </div>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Save these backup codes in a secure place. Each code can only be used once.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <div key={code} className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">
                    {code}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(code, `backup-${index}`)}
                  >
                    {copied[`backup-${index}`] ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <Button variant="destructive" onClick={disable2FA} disabled={loading}>
            {loading ? 'Disabling...' : 'Disable Two-Factor Authentication'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

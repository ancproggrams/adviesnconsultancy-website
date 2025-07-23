
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  LogIn,
  Shield,
  FileText,
  Users
} from 'lucide-react'

export function CustomerLoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // In a real app, this would authenticate the customer
      const response = await fetch('/api/customer-portal/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        window.location.href = '/customer-portal/dashboard'
      } else {
        setError('Ongeldige inloggegevens. Probeer het opnieuw.')
      }
    } catch (error) {
      setError('Er is een fout opgetreden. Probeer het later opnieuw.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">
          Klanten Portal
        </h1>
        <p className="text-muted-foreground">
          Toegang tot uw projecten, documenten en voortgang
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <FileText className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <div className="text-sm font-medium">Projectdocumenten</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <div className="text-sm font-medium">Projectvoortgang</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <Shield className="h-6 w-6 text-purple-600 mx-auto mb-2" />
          <div className="text-sm font-medium">Veilige omgeving</div>
        </div>
      </div>

      {/* Login Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5" />
            Inloggen
          </CardTitle>
          <CardDescription>
            Voer uw toegangsgegevens in om in te loggen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mailadres</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="uw.email@bedrijf.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Wachtwoord</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Voer uw wachtwoord in"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Inloggen...' : 'Inloggen'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Geen toegang? Neem contact op met uw projectmanager of{' '}
              <a href="mailto:info@adviesnconsultancy.nl" className="text-blue-600 hover:underline">
                email ons
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium">Veilige verbinding</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Deze pagina is beveiligd met SSL-encryptie. Uw gegevens zijn volledig beschermd.
        </p>
      </div>
    </div>
  )
}

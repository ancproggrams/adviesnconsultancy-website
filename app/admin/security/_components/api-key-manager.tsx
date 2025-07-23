
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Key, Plus, Eye, EyeOff, Copy, Trash2, Edit, Activity } from 'lucide-react'
import { toast } from 'sonner'

interface ApiKey {
  id: string
  name: string
  key?: string
  permissions: string[]
  rateLimit: number
  isActive: boolean
  lastUsed?: string
  usageCount: number
  expiresAt?: string
  createdAt: string
  usage24h?: number
}

export default function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [newKey, setNewKey] = useState({
    name: '',
    permissions: ['read:general'],
    rateLimit: 1000,
    expiresInDays: undefined as number | undefined
  })

  useEffect(() => {
    loadApiKeys()
  }, [])

  const loadApiKeys = async () => {
    try {
      const response = await fetch('/api/security/api-keys')
      if (response.ok) {
        const data = await response.json()
        setApiKeys(data.apiKeys)
      }
    } catch (error) {
      toast.error('Failed to load API keys')
    } finally {
      setLoading(false)
    }
  }

  const createApiKey = async () => {
    try {
      const response = await fetch('/api/security/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKey)
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('API key created successfully')
        
        // Show the key to user (only time it will be shown)
        toast.info(`API Key: ${data.apiKey.key}`, {
          duration: 10000,
          action: {
            label: 'Copy',
            onClick: () => navigator.clipboard.writeText(data.apiKey.key)
          }
        })
        
        setShowCreateDialog(false)
        setNewKey({
          name: '',
          permissions: ['read:general'],
          rateLimit: 1000,
          expiresInDays: undefined
        })
        loadApiKeys()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create API key')
      }
    } catch (error) {
      toast.error('Failed to create API key')
    }
  }

  const toggleApiKey = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/security/api-keys/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (response.ok) {
        toast.success(`API key ${!isActive ? 'activated' : 'deactivated'}`)
        loadApiKeys()
      } else {
        toast.error('Failed to update API key')
      }
    } catch (error) {
      toast.error('Failed to update API key')
    }
  }

  const deleteApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/security/api-keys/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('API key deleted successfully')
        loadApiKeys()
      } else {
        toast.error('Failed to delete API key')
      }
    } catch (error) {
      toast.error('Failed to delete API key')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Key Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>API Key Management</CardTitle>
            <CardDescription>
              Create and manage API keys for secure access to your application
            </CardDescription>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create API Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New API Key</DialogTitle>
                <DialogDescription>
                  Generate a new API key with specific permissions and rate limits
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newKey.name}
                    onChange={(e) => setNewKey(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My API Key"
                  />
                </div>
                <div>
                  <Label htmlFor="permissions">Permissions (comma-separated)</Label>
                  <Textarea
                    id="permissions"
                    value={newKey.permissions.join(', ')}
                    onChange={(e) => setNewKey(prev => ({ 
                      ...prev, 
                      permissions: e.target.value.split(',').map(p => p.trim()).filter(Boolean) 
                    }))}
                    placeholder="read:general, write:contact, admin:dashboard"
                  />
                </div>
                <div>
                  <Label htmlFor="rateLimit">Rate Limit (requests per hour)</Label>
                  <Input
                    id="rateLimit"
                    type="number"
                    value={newKey.rateLimit}
                    onChange={(e) => setNewKey(prev => ({ ...prev, rateLimit: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="expiresInDays">Expires in (days, optional)</Label>
                  <Input
                    id="expiresInDays"
                    type="number"
                    value={newKey.expiresInDays || ''}
                    onChange={(e) => setNewKey(prev => ({ 
                      ...prev, 
                      expiresInDays: e.target.value ? Number(e.target.value) : undefined 
                    }))}
                    placeholder="365"
                  />
                </div>
                <Button onClick={createApiKey} className="w-full" disabled={!newKey.name}>
                  Create API Key
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Key className="h-4 w-4 text-gray-500" />
                    <h4 className="font-medium">{apiKey.name}</h4>
                    <Badge variant={apiKey.isActive ? "default" : "secondary"}>
                      {apiKey.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date() && (
                      <Badge variant="destructive">Expired</Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <p className="font-medium">Usage</p>
                      <p>{apiKey.usageCount} total calls</p>
                      <p>{apiKey.usage24h || 0} calls today</p>
                    </div>
                    <div>
                      <p className="font-medium">Rate Limit</p>
                      <p>{apiKey.rateLimit} requests/hour</p>
                    </div>
                    <div>
                      <p className="font-medium">Last Used</p>
                      <p>{apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleString() : 'Never'}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Permissions:</p>
                    <div className="flex flex-wrap gap-1">
                      {apiKey.permissions.map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Created: {new Date(apiKey.createdAt).toLocaleDateString()}
                    {apiKey.expiresAt && (
                      <span className="ml-4">
                        Expires: {new Date(apiKey.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleApiKey(apiKey.id, apiKey.isActive)}
                  >
                    {apiKey.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteApiKey(apiKey.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {apiKeys.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No API keys found. Create your first API key to get started.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

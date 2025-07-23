
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FileText, Download, Trash2, Clock, CheckCircle, AlertCircle, User, Shield } from 'lucide-react'
import { toast } from 'sonner'

interface DataProcessingRequest {
  id: string
  email: string
  requestType: string
  status: string
  requestData?: any
  responseData?: any
  processedBy?: string
  processedAt?: string
  createdAt: string
}

interface ConsentRecord {
  email: string
  consentStatus: {
    [key: string]: {
      hasConsent: boolean
      lastUpdated?: string
      source?: string
      withdrawnAt?: string
    }
  }
}

export default function GdprManager() {
  const [dataRequests, setDataRequests] = useState<DataProcessingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<DataProcessingRequest | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [consentEmail, setConsentEmail] = useState('')
  const [consentData, setConsentData] = useState<ConsentRecord | null>(null)
  const [showConsentDialog, setShowConsentDialog] = useState(false)

  useEffect(() => {
    loadDataRequests()
  }, [])

  const loadDataRequests = async () => {
    try {
      const response = await fetch('/api/security/gdpr/data-request')
      if (response.ok) {
        const data = await response.json()
        setDataRequests(data.requests)
      }
    } catch (error) {
      toast.error('Failed to load data processing requests')
    } finally {
      setLoading(false)
    }
  }

  const processRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/security/gdpr/data-request/${requestId}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Data processing request completed successfully')
        
        if (data.result && typeof data.result === 'object') {
          // If it's an access request, offer to download the data
          const blob = new Blob([JSON.stringify(data.result, null, 2)], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `user-data-${requestId}.json`
          a.click()
          URL.revokeObjectURL(url)
        }
        
        loadDataRequests()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to process request')
      }
    } catch (error) {
      toast.error('Failed to process request')
    }
  }

  const checkConsentStatus = async () => {
    if (!consentEmail) {
      toast.error('Please enter an email address')
      return
    }

    try {
      const params = new URLSearchParams({ email: consentEmail })
      const response = await fetch(`/api/security/gdpr/consent?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setConsentData(data)
        setShowConsentDialog(true)
      } else {
        toast.error('Failed to check consent status')
      }
    } catch (error) {
      toast.error('Failed to check consent status')
    }
  }

  const withdrawConsent = async (email: string, consentType: string) => {
    try {
      const response = await fetch('/api/security/gdpr/consent', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consentType })
      })

      if (response.ok) {
        toast.success(`Consent withdrawn for ${consentType}`)
        // Refresh consent data
        checkConsentStatus()
      } else {
        toast.error('Failed to withdraw consent')
      }
    } catch (error) {
      toast.error('Failed to withdraw consent')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'REJECTED':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getRequestTypeColor = (type: string) => {
    switch (type) {
      case 'ACCESS_REQUEST':
        return 'bg-blue-100 text-blue-800'
      case 'DELETION_REQUEST':
        return 'bg-red-100 text-red-800'
      case 'RECTIFICATION_REQUEST':
        return 'bg-yellow-100 text-yellow-800'
      case 'PORTABILITY_REQUEST':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>GDPR Compliance</CardTitle>
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
    <div className="space-y-6">
      {/* GDPR Data Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Data Processing Requests
          </CardTitle>
          <CardDescription>
            Manage user data access, deletion, and rectification requests under GDPR
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dataRequests.map((request) => (
              <div key={request.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(request.status)}
                      <h4 className="font-medium">{request.email}</h4>
                      <Badge className={getRequestTypeColor(request.requestType)}>
                        {request.requestType.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline">
                        {request.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Requested: {new Date(request.createdAt).toLocaleString()}
                    </p>
                    {request.processedAt && (
                      <p className="text-sm text-gray-600">
                        Processed: {new Date(request.processedAt).toLocaleString()}
                        {request.processedBy && ` by Admin`}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {request.status === 'PENDING' && (
                      <Button
                        size="sm"
                        onClick={() => processRequest(request.id)}
                      >
                        Process Request
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedRequest(request)
                        setShowDetails(true)
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {dataRequests.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No data processing requests found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Consent Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Consent Management
          </CardTitle>
          <CardDescription>
            Check and manage user consent for data processing activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Label htmlFor="consentEmail">Email Address</Label>
              <Input
                id="consentEmail"
                type="email"
                value={consentEmail}
                onChange={(e) => setConsentEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={checkConsentStatus}>
                <User className="h-4 w-4 mr-2" />
                Check Consent
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              Full details of the data processing request
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <p className="text-sm font-medium">{selectedRequest.email}</p>
                </div>
                <div>
                  <Label>Request Type</Label>
                  <p className="text-sm font-medium">{selectedRequest.requestType}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <p className="text-sm font-medium">{selectedRequest.status}</p>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="text-sm font-medium">
                    {new Date(selectedRequest.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {selectedRequest.requestData && (
                <div>
                  <Label>Request Data</Label>
                  <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                    {JSON.stringify(selectedRequest.requestData, null, 2)}
                  </pre>
                </div>
              )}
              
              {selectedRequest.responseData && (
                <div>
                  <Label>Response Data</Label>
                  <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-96">
                    {JSON.stringify(selectedRequest.responseData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Consent Status Dialog */}
      <Dialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Consent Status</DialogTitle>
            <DialogDescription>
              Current consent status for {consentEmail}
            </DialogDescription>
          </DialogHeader>
          {consentData && (
            <div className="space-y-4">
              {Object.entries(consentData.consentStatus).map(([type, status]) => (
                <div key={type} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium capitalize">{type}</p>
                    <p className="text-sm text-gray-600">
                      Status: {status.hasConsent ? 'Consented' : 'Not Consented'}
                    </p>
                    {status.lastUpdated && (
                      <p className="text-xs text-gray-500">
                        Last updated: {new Date(status.lastUpdated).toLocaleString()}
                      </p>
                    )}
                    {status.withdrawnAt && (
                      <p className="text-xs text-red-600">
                        Withdrawn: {new Date(status.withdrawnAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={status.hasConsent ? "default" : "secondary"}>
                      {status.hasConsent ? "Consented" : "No Consent"}
                    </Badge>
                    {status.hasConsent && !status.withdrawnAt && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => withdrawConsent(consentEmail, type)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

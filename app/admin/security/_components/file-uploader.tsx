
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Upload, FileText, AlertTriangle, CheckCircle, X, Shield } from 'lucide-react'
import { toast } from 'sonner'

interface UploadResult {
  message: string
  file: {
    name: string
    originalName: string
    size: number
    path: string
    uploadedAt: string
    scanResult: {
      status: string
      threats?: string[]
      details?: string
    }
  }
}

export default function FileUploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = (file: File) => {
    // Basic client-side validation
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB')
      return
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png'
    ]

    if (!allowedTypes.includes(file.type)) {
      toast.error('File type not supported. Please upload PDF, DOC, DOCX, TXT, CSV, XLSX, JPG, or PNG files.')
      return
    }

    setSelectedFile(file)
    setUploadResult(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const uploadFile = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('description', description)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/security/file-upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.ok) {
        const result = await response.json()
        setUploadResult(result)
        toast.success('File uploaded and scanned successfully')
        
        // Reset form
        setSelectedFile(null)
        setDescription('')
      } else {
        const error = await response.json()
        toast.error(error.error || 'File upload failed')
        
        // If it's a security threat, show details
        if (response.status === 400 && error.error?.includes('blocked')) {
          setUploadResult({
            message: error.error,
            file: {
              name: selectedFile.name,
              originalName: selectedFile.name,
              size: selectedFile.size,
              path: '',
              uploadedAt: new Date().toISOString(),
              scanResult: {
                status: 'THREAT_DETECTED',
                details: error.error
              }
            }
          })
        }
      }
    } catch (error) {
      toast.error('Upload failed due to network error')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getScanStatusIcon = (status: string) => {
    switch (status) {
      case 'SAFE':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'THREAT_DETECTED':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'SCANNING':
        return <Shield className="h-5 w-5 text-yellow-500 animate-pulse" />
      default:
        return <Shield className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Secure File Upload
        </CardTitle>
        <CardDescription>
          Upload files with automatic security scanning and threat detection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {selectedFile ? (
            <div className="space-y-2">
              <FileText className="h-12 w-12 text-blue-500 mx-auto" />
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedFile(null)}
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium">Drop files here or click to browse</p>
                <p className="text-sm text-gray-500">
                  Supports PDF, DOC, DOCX, TXT, CSV, XLSX, JPG, PNG (max 10MB)
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect(file)
                }}
              />
              <label htmlFor="file-upload">
                <Button variant="outline" asChild>
                  <span className="cursor-pointer">Browse Files</span>
                </Button>
              </label>
            </div>
          )}
        </div>

        {/* Description Field */}
        <div>
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the purpose of this file..."
            className="mt-1"
          />
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Uploading and scanning...</span>
              <span className="text-sm text-gray-500">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={uploadFile}
          disabled={!selectedFile || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Shield className="h-4 w-4 mr-2 animate-pulse" />
              Scanning File...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload & Scan File
            </>
          )}
        </Button>

        {/* Upload Result */}
        {uploadResult && (
          <Card className={
            uploadResult.file.scanResult.status === 'SAFE' 
              ? 'border-green-500 bg-green-50' 
              : 'border-red-500 bg-red-50'
          }>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                {getScanStatusIcon(uploadResult.file.scanResult.status)}
                <div className="flex-1">
                  <h4 className="font-medium mb-2">Security Scan Results</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>File:</strong> {uploadResult.file.originalName}
                    </p>
                    <p>
                      <strong>Size:</strong> {formatFileSize(uploadResult.file.size)}
                    </p>
                    <p>
                      <strong>Status:</strong> {uploadResult.file.scanResult.status}
                    </p>
                    {uploadResult.file.scanResult.details && (
                      <p>
                        <strong>Details:</strong> {uploadResult.file.scanResult.details}
                      </p>
                    )}
                    {uploadResult.file.scanResult.threats && (
                      <div>
                        <strong>Threats Detected:</strong>
                        <ul className="list-disc list-inside ml-4">
                          {uploadResult.file.scanResult.threats.map((threat, index) => (
                            <li key={index} className="text-red-700">{threat}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {uploadResult.file.scanResult.status === 'SAFE' && (
                      <p className="text-green-700">
                        ✅ File has been successfully uploaded and is safe to use.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-medium text-blue-900 mb-1">Security Features</h4>
              <ul className="text-blue-800 space-y-1">
                <li>• Automatic virus and malware scanning</li>
                <li>• File type and size validation</li>
                <li>• Content analysis for suspicious patterns</li>
                <li>• Quarantine system for detected threats</li>
                <li>• Audit trail for all uploads</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

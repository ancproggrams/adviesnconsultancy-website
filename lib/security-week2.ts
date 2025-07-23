
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// ==== WEEK 2 ADVANCED API AUTHENTICATION ====

// API Key Management
export class ApiKeyManager {
  static async createApiKey(
    adminId: string, 
    name: string, 
    permissions: string[], 
    rateLimit: number = 1000,
    expiresInDays?: number
  ) {
    const key = `ak_${crypto.randomBytes(32).toString('hex')}`
    const hashedKey = await bcrypt.hash(key, 12)
    
    const expiresAt = expiresInDays 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) 
      : undefined

    const apiKey = await prisma.apiKey.create({
      data: {
        name,
        key,
        hashedKey,
        adminId,
        permissions,
        rateLimit,
        expiresAt
      }
    })

    // Log API key creation
    await SecurityLogger.logEvent('API_KEY_CREATED', 'MEDIUM', {
      adminId,
      keyName: name,
      permissions,
      rateLimit
    })

    return { apiKey, plainKey: key }
  }

  static async validateApiKey(key: string): Promise<{
    isValid: boolean
    apiKey?: any
    error?: string
  }> {
    try {
      const apiKey = await prisma.apiKey.findUnique({
        where: { key }
      })

      if (!apiKey) {
        return { isValid: false, error: 'Invalid API key' }
      }

      if (!apiKey.isActive) {
        return { isValid: false, error: 'API key is inactive' }
      }

      if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
        return { isValid: false, error: 'API key has expired' }
      }

      // Update last used and usage count
      await prisma.apiKey.update({
        where: { id: apiKey.id },
        data: {
          lastUsed: new Date(),
          usageCount: { increment: 1 }
        }
      })

      return { isValid: true, apiKey }
    } catch (error) {
      return { isValid: false, error: 'API key validation failed' }
    }
  }

  static async checkRateLimit(apiKeyId: string): Promise<boolean> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    
    const usageCount = await prisma.apiUsage.count({
      where: {
        apiKeyId,
        timestamp: { gte: oneHourAgo }
      }
    })

    const apiKey = await prisma.apiKey.findUnique({
      where: { id: apiKeyId }
    })

    return usageCount < (apiKey?.rateLimit || 1000)
  }

  static async logApiUsage(
    apiKeyId: string,
    endpoint: string,
    method: string,
    ipAddress: string,
    userAgent: string,
    status: number,
    duration: number
  ) {
    await prisma.apiUsage.create({
      data: {
        apiKeyId,
        endpoint,
        method,
        ipAddress,
        userAgent,
        status,
        duration
      }
    })
  }
}

// ==== ADVANCED SESSION MANAGEMENT ====

export class SessionManager {
  static async trackSessionActivity(
    sessionToken: string,
    adminId: string,
    activity: string,
    ipAddress: string,
    userAgent: string,
    isSuccessful: boolean = true,
    metadata?: any
  ) {
    await prisma.sessionActivity.create({
      data: {
        sessionToken,
        adminId,
        activity,
        ipAddress,
        userAgent,
        isSuccessful,
        metadata
      }
    })
  }

  static async createActiveSession(
    sessionToken: string,
    adminId: string,
    ipAddress: string,
    userAgent: string
  ) {
    // Check concurrent session limit
    const preferences = await prisma.adminSecurityPreference.findUnique({
      where: { adminId }
    })

    const maxSessions = preferences?.maxConcurrentSessions || 3
    
    const existingSessions = await prisma.activeSession.count({
      where: { adminId, isActive: true }
    })

    if (existingSessions >= maxSessions) {
      // Deactivate oldest session
      const oldestSession = await prisma.activeSession.findFirst({
        where: { adminId, isActive: true },
        orderBy: { lastActivity: 'asc' }
      })

      if (oldestSession) {
        await prisma.activeSession.update({
          where: { id: oldestSession.id },
          data: { isActive: false }
        })

        await SecurityLogger.logEvent('SESSION_LIMIT_EXCEEDED', 'MEDIUM', {
          adminId,
          deactivatedSession: oldestSession.id
        })
      }
    }

    return await prisma.activeSession.create({
      data: {
        sessionToken,
        adminId,
        ipAddress,
        userAgent
      }
    })
  }

  static async updateSessionActivity(sessionToken: string) {
    await prisma.activeSession.updateMany({
      where: { sessionToken, isActive: true },
      data: { lastActivity: new Date() }
    })
  }

  static async detectSuspiciousActivity(
    adminId: string,
    currentIp: string,
    userAgent: string
  ): Promise<{ suspicious: boolean; reasons: string[] }> {
    const reasons: string[] = []
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

    // Check for multiple IP addresses in short time
    const recentActivities = await prisma.sessionActivity.findMany({
      where: {
        adminId,
        timestamp: { gte: oneHourAgo }
      },
      select: { ipAddress: true, userAgent: true }
    })

    const uniqueIps = new Set(recentActivities.map(a => a.ipAddress))
    if (uniqueIps.size > 3) {
      reasons.push('Multiple IP addresses detected')
    }

    // Check for different user agents
    const uniqueUserAgents = new Set(recentActivities.map(a => a.userAgent))
    if (uniqueUserAgents.size > 2) {
      reasons.push('Multiple user agents detected')
    }

    // Check for failed login attempts
    const failedLogins = await prisma.sessionActivity.count({
      where: {
        adminId,
        activity: 'login',
        isSuccessful: false,
        timestamp: { gte: oneHourAgo }
      }
    })

    if (failedLogins > 5) {
      reasons.push('Multiple failed login attempts')
    }

    return {
      suspicious: reasons.length > 0,
      reasons
    }
  }

  static async invalidateSessionsOnSuspiciousActivity(adminId: string) {
    // Deactivate all active sessions
    await prisma.activeSession.updateMany({
      where: { adminId, isActive: true },
      data: { isActive: false }
    })

    // Log security event
    await SecurityLogger.logEvent('SUSPICIOUS_ACTIVITY_SESSION_INVALIDATION', 'HIGH', {
      adminId,
      action: 'All sessions invalidated due to suspicious activity'
    })
  }

  static async cleanupExpiredSessions() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    await prisma.activeSession.deleteMany({
      where: {
        OR: [
          { lastActivity: { lt: oneDayAgo } },
          { isActive: false }
        ]
      }
    })
  }
}

// ==== ENHANCED INPUT VALIDATION & SANITIZATION ====

export class ValidationManager {
  // File upload validation
  static validateFileUpload(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      errors.push('File size exceeds 10MB limit')
    }

    // Check file extension
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.csv', '.xlsx', '.jpg', '.jpeg', '.png']
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    
    if (!allowedExtensions.includes(extension)) {
      errors.push('File type not allowed')
    }

    // Check MIME type
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png'
    ]

    if (!allowedMimeTypes.includes(file.type)) {
      errors.push('Invalid MIME type')
    }

    return { isValid: errors.length === 0, errors }
  }

  // Advanced SQL injection detection
  static detectSqlInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT( +INTO)?|MERGE|SELECT|UPDATE|UNION( +ALL)?)\b)/i,
      /(;|\||`|'|"|\*|\%|<|>|\^|&|\?)/g,
      /(\b(AND|OR)\b.{1,6}?\b(=|>|<|\!=|<>|<=|>=)\b)/i,
      /(\b(HAVING|WHERE)\b.{1,6}?\b(=|>|<|\!=|<>|<=|>=)\b)/i,
      /(sp_executesql)/i
    ]

    return sqlPatterns.some(pattern => pattern.test(input))
  }

  // Advanced XSS detection
  static detectXss(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /expression\s*\(/gi,
      /vbscript:/gi
    ]

    return xssPatterns.some(pattern => pattern.test(input))
  }

  // Comprehensive input sanitization
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') return ''
    
    return input
      // Remove HTML tags
      .replace(/<[^>]*>/g, '')
      // Remove script content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove dangerous protocols
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '')
      // Remove event handlers
      .replace(/on\w+\s*=/gi, '')
      // Remove SQL injection patterns
      .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC)\b)/gi, '')
      // Remove dangerous characters
      .replace(/[<>'"`;]/g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim()
  }
}

// ==== SECURITY EVENT LOGGING & MONITORING ====

export class SecurityLogger {
  static async logEvent(
    type: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    metadata: any,
    source: string = 'api',
    adminId?: string,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    try {
      const event = await prisma.securityEvent.create({
        data: {
          type: type as any,
          severity: severity as any,
          title: this.generateEventTitle(type),
          description: this.generateEventDescription(type, metadata),
          source,
          adminId,
          sessionId,
          ipAddress: ipAddress || 'unknown',
          userAgent,
          metadata
        }
      })

      // Create alert for high/critical events
      if (severity === 'HIGH' || severity === 'CRITICAL') {
        await this.createSecurityAlert(type, severity, metadata)
      }

      console.log(`🛡️ [SECURITY-${severity}] ${type}:`, metadata)
      return event
    } catch (error) {
      console.error('Failed to log security event:', error)
    }
  }

  private static generateEventTitle(type: string): string {
    const titles: Record<string, string> = {
      'AUTHENTICATION_FAILURE': 'Failed Authentication Attempt',
      'RATE_LIMIT_EXCEEDED': 'Rate Limit Exceeded',
      'SUSPICIOUS_ACTIVITY': 'Suspicious Activity Detected',
      'UNAUTHORIZED_ACCESS': 'Unauthorized Access Attempt',
      'MALICIOUS_REQUEST': 'Malicious Request Detected',
      'SESSION_HIJACKING': 'Potential Session Hijacking',
      'BRUTE_FORCE_ATTACK': 'Brute Force Attack Detected',
      'SQL_INJECTION_ATTEMPT': 'SQL Injection Attempt',
      'XSS_ATTEMPT': 'XSS Attack Attempt',
      'CSRF_ATTEMPT': 'CSRF Attack Attempt',
      'FILE_UPLOAD_THREAT': 'Malicious File Upload',
      'API_ABUSE': 'API Abuse Detected',
      'API_KEY_CREATED': 'API Key Created',
      'SUSPICIOUS_ACTIVITY_SESSION_INVALIDATION': 'Sessions Invalidated'
    }
    return titles[type] || `Security Event: ${type}`
  }

  private static generateEventDescription(type: string, metadata: any): string {
    switch (type) {
      case 'RATE_LIMIT_EXCEEDED':
        return `Rate limit exceeded from IP ${metadata.ipAddress}. Limit: ${metadata.limit}, Window: ${metadata.window}ms`
      case 'AUTHENTICATION_FAILURE':
        return `Failed login attempt for user ${metadata.email} from IP ${metadata.ipAddress}`
      case 'SUSPICIOUS_ACTIVITY':
        return `Suspicious activity detected: ${metadata.reasons?.join(', ')}`
      case 'SQL_INJECTION_ATTEMPT':
        return `SQL injection attempt detected in input: ${metadata.input?.substring(0, 100)}`
      case 'XSS_ATTEMPT':
        return `XSS attempt detected in input: ${metadata.input?.substring(0, 100)}`
      default:
        return `Security event of type ${type} occurred`
    }
  }

  private static async createSecurityAlert(
    type: string,
    severity: 'HIGH' | 'CRITICAL',
    metadata: any
  ) {
    await prisma.securityAlert.create({
      data: {
        type,
        severity: severity as any,
        title: this.generateEventTitle(type),
        message: this.generateEventDescription(type, metadata),
        metadata,
        triggered: true
      }
    })
  }

  static async getSecurityDashboardData() {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const [
      recentEvents,
      eventsByType,
      eventsBySeverity,
      activeAlerts,
      apiUsageStats
    ] = await Promise.all([
      prisma.securityEvent.findMany({
        where: { createdAt: { gte: last24Hours } },
        orderBy: { createdAt: 'desc' },
        take: 20
      }),
      prisma.securityEvent.groupBy({
        by: ['type'],
        where: { createdAt: { gte: last7Days } },
        _count: true
      }),
      prisma.securityEvent.groupBy({
        by: ['severity'],
        where: { createdAt: { gte: last7Days } },
        _count: true
      }),
      prisma.securityAlert.findMany({
        where: { 
          triggered: true,
          acknowledged: false 
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.apiUsage.groupBy({
        by: ['endpoint'],
        where: { timestamp: { gte: last24Hours } },
        _count: true,
        _avg: { duration: true }
      })
    ])

    return {
      recentEvents,
      eventsByType,
      eventsBySeverity,
      activeAlerts,
      apiUsageStats
    }
  }
}

// ==== FILE UPLOAD SECURITY ====

export class FileSecurityManager {
  static async scanFile(
    file: File,
    uploadedBy: string
  ): Promise<{ safe: boolean; scanResult: any }> {
    const fileBuffer = await file.arrayBuffer()
    const checksum = crypto
      .createHash('sha256')
      .update(Buffer.from(fileBuffer))
      .digest('hex')

    // Basic file validation
    const validation = ValidationManager.validateFileUpload(file)
    if (!validation.isValid) {
      return {
        safe: false,
        scanResult: {
          status: 'THREAT_DETECTED',
          threats: validation.errors,
          details: 'File validation failed'
        }
      }
    }

    // Store file metadata
    const fileRecord = await prisma.fileUpload.create({
      data: {
        fileName: `${Date.now()}-${file.name}`,
        originalName: file.name,
        filePath: `/uploads/${Date.now()}-${file.name}`,
        fileSize: file.size,
        mimeType: file.type,
        checksum,
        uploadedBy,
        scanStatus: 'SCANNING'
      }
    })

    // Simulate virus scanning (in production, integrate with actual AV)
    const scanResult = await this.performVirusScan(fileBuffer, checksum)
    
    await prisma.fileUpload.update({
      where: { id: fileRecord.id },
      data: {
        scanStatus: scanResult.safe ? 'SAFE' : 'THREAT_DETECTED',
        scanResult,
        scannedAt: new Date(),
        isQuarantine: !scanResult.safe
      }
    })

    if (!scanResult.safe) {
      await SecurityLogger.logEvent('FILE_UPLOAD_THREAT', 'HIGH', {
        fileName: file.name,
        fileSize: file.size,
        uploadedBy,
        threats: scanResult.threats
      })
    }

    return { safe: scanResult.safe, scanResult }
  }

  private static async performVirusScan(
    fileBuffer: ArrayBuffer,
    checksum: string
  ): Promise<{ safe: boolean; threats?: string[]; details?: string }> {
    // In production, integrate with actual antivirus API
    // For now, simulate scanning with basic heuristics
    
    const buffer = Buffer.from(fileBuffer)
    const threats: string[] = []

    // Check for suspicious file headers
    const header = buffer.slice(0, 100).toString('hex')
    
    // Check for executable signatures
    if (header.startsWith('4d5a') || header.startsWith('7f454c46')) {
      threats.push('Executable file detected')
    }

    // Check for script content in supposedly safe files
    const content = buffer.toString('utf8', 0, Math.min(1000, buffer.length))
    if (content.includes('<script>') || content.includes('eval(') || content.includes('document.write')) {
      threats.push('Suspicious script content detected')
    }

    return {
      safe: threats.length === 0,
      threats: threats.length > 0 ? threats : undefined,
      details: threats.length > 0 ? 'File contains potential threats' : 'File appears safe'
    }
  }
}

// ==== GDPR COMPLIANCE UTILITIES ====

export class GdprManager {
  static async createDataProcessingRequest(
    email: string,
    requestType: 'ACCESS_REQUEST' | 'DELETION_REQUEST' | 'RECTIFICATION_REQUEST' | 'PORTABILITY_REQUEST' | 'RESTRICTION_REQUEST',
    requestData?: any
  ) {
    return await prisma.dataProcessingRequest.create({
      data: {
        email,
        requestType: requestType as any,
        requestData
      }
    })
  }

  static async processAccessRequest(requestId: string, processedBy: string) {
    const request = await prisma.dataProcessingRequest.findUnique({
      where: { id: requestId }
    })

    if (!request || request.requestType !== 'ACCESS_REQUEST') {
      throw new Error('Invalid access request')
    }

    // Collect all data for the user
    const userData = await this.collectUserData(request.email)

    await prisma.dataProcessingRequest.update({
      where: { id: requestId },
      data: {
        status: 'COMPLETED',
        responseData: userData,
        processedBy,
        processedAt: new Date()
      }
    })

    return userData
  }

  static async processDeletionRequest(requestId: string, processedBy: string) {
    const request = await prisma.dataProcessingRequest.findUnique({
      where: { id: requestId }
    })

    if (!request || request.requestType !== 'DELETION_REQUEST') {
      throw new Error('Invalid deletion request')
    }

    // Delete all user data
    const deletionResult = await this.deleteUserData(request.email)

    await prisma.dataProcessingRequest.update({
      where: { id: requestId },
      data: {
        status: 'COMPLETED',
        responseData: deletionResult,
        processedBy,
        processedAt: new Date()
      }
    })

    await SecurityLogger.logEvent('DATA_DELETION_COMPLETED', 'MEDIUM', {
      email: request.email,
      processedBy,
      deletedRecords: deletionResult
    })

    return deletionResult
  }

  private static async collectUserData(email: string) {
    const [
      contacts,
      quickScans,
      newsletters,
      chatConversations,
      crmContacts,
      customers
    ] = await Promise.all([
      prisma.contact.findMany({ where: { email } }),
      prisma.quickScanResult.findMany({ where: { email } }),
      prisma.newsletterSubscriber.findMany({ where: { email } }),
      prisma.chatConversation.findMany({ 
        where: { userEmail: email },
        include: { messages: true }
      }),
      prisma.crmContact.findMany({ where: { email } }),
      prisma.customer.findMany({ where: { email } })
    ])

    return {
      contacts,
      quickScans,
      newsletters,
      chatConversations,
      crmContacts,
      customers,
      exportedAt: new Date().toISOString()
    }
  }

  private static async deleteUserData(email: string) {
    const deletionResults = {
      contacts: 0,
      quickScans: 0,
      newsletters: 0,
      chatConversations: 0,
      crmContacts: 0,
      customers: 0
    }

    // Delete in order to respect foreign key constraints
    const { count: chatCount } = await prisma.chatConversation.deleteMany({
      where: { userEmail: email }
    })
    deletionResults.chatConversations = chatCount

    const { count: contactCount } = await prisma.contact.deleteMany({
      where: { email }
    })
    deletionResults.contacts = contactCount

    const { count: quickScanCount } = await prisma.quickScanResult.deleteMany({
      where: { email }
    })
    deletionResults.quickScans = quickScanCount

    const { count: newsletterCount } = await prisma.newsletterSubscriber.deleteMany({
      where: { email }
    })
    deletionResults.newsletters = newsletterCount

    const { count: crmCount } = await prisma.crmContact.deleteMany({
      where: { email }
    })
    deletionResults.crmContacts = crmCount

    const { count: customerCount } = await prisma.customer.deleteMany({
      where: { email }
    })
    deletionResults.customers = customerCount

    return deletionResults
  }

  static async recordConsent(
    email: string,
    consentType: string,
    hasConsent: boolean,
    source: string,
    ipAddress: string,
    userAgent?: string
  ) {
    return await prisma.consentRecord.create({
      data: {
        email,
        consentType,
        hasConsent,
        consentSource: source,
        ipAddress,
        userAgent
      }
    })
  }

  static async withdrawConsent(email: string, consentType: string) {
    return await prisma.consentRecord.updateMany({
      where: { 
        email, 
        consentType,
        hasConsent: true,
        withdrawnAt: null
      },
      data: {
        hasConsent: false,
        withdrawnAt: new Date()
      }
    })
  }
}

// ==== REAL-TIME ALERTING SYSTEM ====

export class AlertManager {
  static async checkSecurityThresholds() {
    const last10Minutes = new Date(Date.now() - 10 * 60 * 1000)
    
    // Check for rate limit violations
    const rateLimitEvents = await prisma.securityEvent.count({
      where: {
        type: 'RATE_LIMIT_EXCEEDED',
        createdAt: { gte: last10Minutes }
      }
    })

    if (rateLimitEvents > 10) {
      await this.createAlert(
        'RATE_LIMIT_SPIKE',
        'HIGH',
        'Unusual spike in rate limit violations',
        `${rateLimitEvents} rate limit violations in the last 10 minutes`
      )
    }

    // Check for authentication failures
    const authFailures = await prisma.securityEvent.count({
      where: {
        type: 'AUTHENTICATION_FAILURE',
        createdAt: { gte: last10Minutes }
      }
    })

    if (authFailures > 20) {
      await this.createAlert(
        'AUTH_FAILURE_SPIKE',
        'CRITICAL',
        'Potential brute force attack',
        `${authFailures} authentication failures in the last 10 minutes`
      )
    }

    // Check for suspicious activities
    const suspiciousActivities = await prisma.securityEvent.count({
      where: {
        type: 'SUSPICIOUS_ACTIVITY',
        createdAt: { gte: last10Minutes }
      }
    })

    if (suspiciousActivities > 5) {
      await this.createAlert(
        'SUSPICIOUS_ACTIVITY_SPIKE',
        'HIGH',
        'Multiple suspicious activities detected',
        `${suspiciousActivities} suspicious activities in the last 10 minutes`
      )
    }
  }

  private static async createAlert(
    type: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    title: string,
    message: string
  ) {
    return await prisma.securityAlert.create({
      data: {
        type,
        severity: severity as any,
        title,
        message,
        triggered: true
      }
    })
  }

  static async acknowledgeAlert(alertId: string, acknowledgedBy: string) {
    return await prisma.securityAlert.update({
      where: { id: alertId },
      data: {
        acknowledged: true,
        acknowledgedBy,
        acknowledgedAt: new Date()
      }
    })
  }
}

// ==== COMPREHENSIVE VALIDATION SCHEMAS ====

export const apiKeySchema = z.object({
  name: z.string().min(3).max(100),
  permissions: z.array(z.string()),
  rateLimit: z.number().min(100).max(10000).optional(),
  expiresInDays: z.number().min(1).max(365).optional()
})

export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  description: z.string().max(500).optional()
})

export const dataProcessingRequestSchema = z.object({
  email: z.string().email(),
  requestType: z.enum(['ACCESS_REQUEST', 'DELETION_REQUEST', 'RECTIFICATION_REQUEST', 'PORTABILITY_REQUEST', 'RESTRICTION_REQUEST']),
  description: z.string().max(1000).optional()
})

export const consentSchema = z.object({
  email: z.string().email(),
  consentType: z.string(),
  hasConsent: z.boolean(),
  source: z.string()
})



import { NextRequest } from 'next/server'

export interface SecurityMetrics {
  ipAddress: string
  userAgent: string
  timestamp: number
  endpoint: string
  method: string
  suspicious: boolean
  reason?: string
}

export class SecurityMonitor {
  private static instance: SecurityMonitor
  private attempts: Map<string, number> = new Map()
  private blockedIPs: Set<string> = new Set()
  private lastCleanup: number = Date.now()

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor()
    }
    return SecurityMonitor.instance
  }

  checkRequest(request: NextRequest): { allowed: boolean; reason?: string } {
    const ip = request.ip || request.headers.get('X-Forwarded-For') || 'unknown'
    const userAgent = request.headers.get('User-Agent') || 'unknown'
    const currentTime = Date.now()
    
    // Cleanup old entries every hour
    if (currentTime - this.lastCleanup > 3600000) {
      this.cleanup()
    }
    
    // Check if IP is blocked
    if (this.blockedIPs.has(ip)) {
      return { allowed: false, reason: 'IP blocked' }
    }
    
    // Check rate limiting
    const attemptKey = `${ip}:${Math.floor(currentTime / 60000)}` // Per minute
    const attempts = this.attempts.get(attemptKey) || 0
    
    if (attempts > 100) { // 100 requests per minute
      this.blockedIPs.add(ip)
      return { allowed: false, reason: 'Rate limit exceeded' }
    }
    
    this.attempts.set(attemptKey, attempts + 1)
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /sql|union|select|drop|delete|insert|update|exec|script/i,
      /\.\./,
      /%00|%2e%2e|%252e%252e/i,
      /javascript:|data:|vbscript:/i,
    ]
    
    const url = request.nextUrl.pathname + request.nextUrl.search
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(url))
    
    if (isSuspicious) {
      this.logSuspiciousActivity({
        ipAddress: ip,
        userAgent,
        timestamp: currentTime,
        endpoint: request.nextUrl.pathname,
        method: request.method,
        suspicious: true,
        reason: 'Suspicious URL pattern detected'
      })
    }
    
    return { allowed: true }
  }
  
  private cleanup(): void {
    const now = Date.now()
    const oneHourAgo = now - 3600000
    
    // Remove old attempt records
    for (const [key, _] of this.attempts.entries()) {
      const timestamp = parseInt(key.split(':')[1]) * 60000
      if (timestamp < oneHourAgo) {
        this.attempts.delete(key)
      }
    }
    
    this.lastCleanup = now
  }
  
  private logSuspiciousActivity(metrics: SecurityMetrics): void {
    // In production, send to security monitoring service
    if (process.env.NODE_ENV === 'development') {
      console.warn('Suspicious activity detected:', metrics)
    }
  }
}

export function validateInput(input: string): boolean {
  // Basic input validation
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /eval\(/i,
    /expression\(/i,
    /url\(/i,
    /import\(/i,
  ]
  
  return !dangerousPatterns.some(pattern => pattern.test(input))
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

export function generateCSPNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString('base64')
}

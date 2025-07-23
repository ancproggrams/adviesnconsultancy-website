
import { NextRequest } from 'next/server'
import { z } from 'zod'

// Enhanced input sanitization
export function sanitizeInput(input: string): string {
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
    // Remove dangerous characters
    .replace(/[<>'"]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

// SQL injection protection
export function sanitizeForDatabase(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .replace(/['"\\;]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .replace(/xp_/gi, '')
    .replace(/sp_/gi, '')
    .trim()
}

// Email validation with enhanced security
export const emailSchema = z.string()
  .email('Invalid email format')
  .min(5, 'Email too short')
  .max(254, 'Email too long')
  .refine((email) => {
    // Additional security checks
    const suspiciousPatterns = [
      /script/i,
      /javascript/i,
      /eval/i,
      /function/i,
      /<|>/,
      /['"]/
    ]
    return !suspiciousPatterns.some(pattern => pattern.test(email))
  }, 'Email contains suspicious content')

// Password validation
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
    'Password must contain uppercase, lowercase, number and special character')

// Request validation
export function validateRequest(request: NextRequest): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // Check content type for POST/PUT requests
  const method = request.method
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    const contentType = request.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      errors.push('Invalid content type')
    }
  }
  
  // Check for suspicious headers
  const userAgent = request.headers.get('user-agent') || ''
  const suspiciousUAPatterns = [
    /sqlmap/i,
    /nikto/i,
    /burp/i,
    /nessus/i,
    /masscan/i
  ]
  
  if (suspiciousUAPatterns.some(pattern => pattern.test(userAgent))) {
    errors.push('Suspicious user agent detected')
  }
  
  // Check for common attack patterns in URL
  const url = request.url
  const attackPatterns = [
    /union.*select/i,
    /script.*alert/i,
    /eval\(/i,
    /javascript:/i,
    /\.\.\/\.\.\//,
    /%2e%2e%2f/i,
    /etc\/passwd/i,
    /cmd\.exe/i
  ]
  
  if (attackPatterns.some(pattern => pattern.test(url))) {
    errors.push('Suspicious URL pattern detected')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Rate limiting helpers
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function checkApiRateLimit(
  identifier: string, 
  limit: number = 60, 
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const current = requestCounts.get(identifier)
  
  if (!current || now > current.resetTime) {
    const resetTime = now + windowMs
    requestCounts.set(identifier, { count: 1, resetTime })
    return { allowed: true, remaining: limit - 1, resetTime }
  }
  
  if (current.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime }
  }
  
  current.count += 1
  return { 
    allowed: true, 
    remaining: limit - current.count, 
    resetTime: current.resetTime 
  }
}

// CSRF protection
export function validateCSRF(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const host = request.headers.get('host')
  
  // Allow same-origin requests
  if (origin) {
    const originHost = new URL(origin).host
    return originHost === host
  }
  
  if (referer) {
    const refererHost = new URL(referer).host
    return refererHost === host
  }
  
  // For API routes, require explicit origin or referer
  return false
}

// Input validation schemas
export const contactFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .transform(sanitizeInput),
  email: emailSchema,
  company: z.string()
    .max(200, 'Company name too long')
    .optional()
    .transform(val => val ? sanitizeInput(val) : val),
  phone: z.string()
    .max(20, 'Phone number too long')
    .optional()
    .transform(val => val ? sanitizeInput(val) : val),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message too long')
    .transform(sanitizeInput),
  formType: z.string()
    .max(50, 'Form type too long')
    .optional()
    .transform(val => val ? sanitizeInput(val) : val)
})

// API response helpers
export function createSecureApiResponse(data: any, status: number = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    }
  })
}

export function createErrorResponse(message: string, status: number = 400) {
  return createSecureApiResponse({ 
    error: sanitizeInput(message),
    timestamp: new Date().toISOString()
  }, status)
}

// Security logging
export function logSecurityEvent(
  event: string, 
  details: Record<string, any>, 
  severity: 'low' | 'medium' | 'high' = 'medium'
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event: sanitizeInput(event),
    severity,
    details: Object.fromEntries(
      Object.entries(details).map(([key, value]) => [
        key,
        typeof value === 'string' ? sanitizeInput(value) : value
      ])
    )
  }
  
  console.log(`🛡️ [SECURITY-${severity.toUpperCase()}]`, JSON.stringify(logEntry))
  
  // In production, send to security monitoring system
  if (process.env.NODE_ENV === 'production' && severity === 'high') {
    // TODO: Send to security monitoring service
  }
}

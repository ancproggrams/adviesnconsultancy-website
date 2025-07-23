
import { NextRequest, NextResponse } from 'next/server'
import { 
  validateRequest, 
  checkApiRateLimit, 
  validateCSRF,
  contactFormSchema,
  createSecureApiResponse,
  createErrorResponse,
  logSecurityEvent
} from '@/lib/security-enhanced'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Enhanced security validation
    const validation = validateRequest(request)
    if (!validation.isValid) {
      logSecurityEvent('API_VALIDATION_FAILED', {
        endpoint: '/api/contact',
        errors: validation.errors,
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      }, 'high')
      return createErrorResponse('Request validation failed', 400)
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimit = checkApiRateLimit(`contact:${ip}`, 5, 15 * 60 * 1000) // 5 requests per 15 minutes
    
    if (!rateLimit.allowed) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', {
        endpoint: '/api/contact',
        ip,
        resetTime: rateLimit.resetTime
      }, 'medium')
      
      return Response.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.floor(rateLimit.resetTime / 1000).toString()
          }
        }
      )
    }

    // CSRF validation for non-GET requests
    if (!validateCSRF(request)) {
      logSecurityEvent('CSRF_VALIDATION_FAILED', {
        endpoint: '/api/contact',
        ip,
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer')
      }, 'high')
      return createErrorResponse('CSRF validation failed', 403)
    }

    const body = await request.json()
    
    // Enhanced input validation using Zod schema
    const validationResult = contactFormSchema.safeParse(body)
    if (!validationResult.success) {
      logSecurityEvent('INPUT_VALIDATION_FAILED', {
        endpoint: '/api/contact',
        ip,
        errors: validationResult.error.issues
      }, 'medium')
      
      return createErrorResponse(
        `Validation failed: ${validationResult.error.issues.map(i => i.message).join(', ')}`,
        400
      )
    }

    const sanitizedData = validationResult.data

    // Save to database with enhanced logging
    try {
      await prisma.contact.create({
        data: {
          name: sanitizedData.name,
          email: sanitizedData.email,
          company: sanitizedData.company || null,
          phone: sanitizedData.phone || null,
          message: sanitizedData.message,
          formType: sanitizedData.formType || 'general',
          interest: sanitizedData.formType || null
        }
      })

      // Security logging for successful submission
      logSecurityEvent('CONTACT_FORM_SUBMITTED', {
        email: sanitizedData.email,
        ip,
        formType: sanitizedData.formType
      }, 'low')

    } catch (dbError) {
      console.error('Database error:', dbError)
      logSecurityEvent('DATABASE_ERROR', {
        endpoint: '/api/contact',
        error: 'Failed to save contact submission',
        ip
      }, 'high')
      
      return createErrorResponse('Failed to process submission', 500)
    }

    return createSecureApiResponse({
      success: true,
      message: 'Thank you for your submission. We will contact you within 24 hours.'
    })

  } catch (error) {
    console.error('Contact form error:', error)
    
    logSecurityEvent('API_ERROR', {
      endpoint: '/api/contact',
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    }, 'high')
    
    return createErrorResponse('Internal server error', 500)
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}


import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seedWeek2SecurityData() {
  console.log('🔒 Seeding Week 2 Security Data...')

  try {
    // Get or create a super admin
    let superAdmin = await prisma.admin.findFirst({
      where: { role: 'SUPER_ADMIN' }
    })

    if (!superAdmin) {
      const hashedPassword = await bcrypt.hash('SuperAdmin2025!', 12)
      superAdmin = await prisma.admin.create({
        data: {
          email: 'superadmin@adviesnconsultancy.nl',
          name: 'Super Administrator',
          hashedPassword,
          role: 'SUPER_ADMIN',
          isActive: true
        }
      })
    }

    // Create sample API keys
    console.log('📋 Creating sample API keys...')
    
    const apiKeyData = [
      {
        name: 'Development API Key',
        key: `ak_dev_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        hashedKey: await bcrypt.hash(`dev_key_${Date.now()}`, 12),
        adminId: superAdmin.id,
        permissions: ['read:general', 'write:contact', 'read:blog'],
        rateLimit: 500,
        isActive: true
      },
      {
        name: 'Production API Key',
        key: `ak_prod_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        hashedKey: await bcrypt.hash(`prod_key_${Date.now()}`, 12),
        adminId: superAdmin.id,
        permissions: ['read:general', 'read:analytics'],
        rateLimit: 2000,
        isActive: true
      },
      {
        name: 'Analytics API Key',
        key: `ak_analytics_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        hashedKey: await bcrypt.hash(`analytics_key_${Date.now()}`, 12),
        adminId: superAdmin.id,
        permissions: ['read:analytics', 'write:metrics'],
        rateLimit: 1000,
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      }
    ]

    for (const keyData of apiKeyData) {
      await prisma.apiKey.upsert({
        where: { key: keyData.key },
        update: {},
        create: keyData
      })
    }

    // Create sample security events
    console.log('🛡️ Creating sample security events...')
    
    const securityEvents = [
      {
        type: 'AUTHENTICATION_FAILURE',
        severity: 'MEDIUM',
        title: 'Failed Login Attempt',
        description: 'Failed admin login attempt - account locked',
        source: 'auth',
        adminId: superAdmin.id,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        metadata: { loginMethod: 'credentials', attempts: 3, accountLocked: true },
        resolved: true
      },
      {
        type: 'RATE_LIMIT_EXCEEDED',
        severity: 'MEDIUM',
        title: 'API Rate Limit Exceeded',
        description: 'Rate limit exceeded for IP address 203.0.113.45',
        source: 'middleware',
        ipAddress: '203.0.113.45',
        userAgent: 'curl/7.68.0',
        metadata: { limit: 60, timeWindow: '5 minutes', requestCount: 75 }
      },
      {
        type: 'SUSPICIOUS_ACTIVITY',
        severity: 'HIGH',
        title: 'Multiple IP Login Attempts',
        description: 'User attempted login from multiple IP addresses',
        source: 'auth',
        adminId: superAdmin.id,
        ipAddress: '198.51.100.10',
        userAgent: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1)',
        metadata: { 
          ipAddresses: ['192.168.1.100', '198.51.100.10', '203.0.113.25'],
          timeSpan: '30 minutes'
        }
      },
      {
        type: 'XSS_ATTEMPT',
        severity: 'HIGH',
        title: 'XSS Attack Attempt Blocked',
        description: 'Malicious script injection attempt detected and blocked',
        source: 'middleware',
        ipAddress: '198.51.100.42',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        metadata: { 
          payload: '<script>alert("xss")</script>',
          endpoint: '/api/contact',
          blocked: true
        }
      },
      {
        type: 'SQL_INJECTION_ATTEMPT',
        severity: 'CRITICAL',
        title: 'SQL Injection Attack Blocked',
        description: 'SQL injection attempt detected and blocked in middleware',
        source: 'middleware',
        ipAddress: '203.0.113.99',
        userAgent: 'sqlmap/1.6.7',
        metadata: { 
          payload: "'; DROP TABLE users; --",
          endpoint: '/api/search',
          blocked: true
        }
      }
    ]

    for (const event of securityEvents) {
      await prisma.securityEvent.create({
        data: {
          ...event,
          type: event.type as any,
          severity: event.severity as any
        }
      })
    }

    // Create sample security alerts
    console.log('🚨 Creating sample security alerts...')
    
    const securityAlerts = [
      {
        type: 'BRUTE_FORCE_ATTACK',
        severity: 'CRITICAL',
        title: 'Brute Force Attack Detected',
        message: 'Multiple failed login attempts detected from IP 203.0.113.89. Account temporarily locked.',
        metadata: { 
          ipAddress: '203.0.113.89',
          attempts: 15,
          timeWindow: '10 minutes',
          actionTaken: 'account_locked'
        },
        triggered: true,
        acknowledged: false
      },
      {
        type: 'API_ABUSE',
        severity: 'HIGH',
        title: 'API Rate Limit Abuse',
        message: 'Sustained API rate limit violations detected. Possible bot activity.',
        metadata: { 
          violations: 25,
          timeWindow: '1 hour',
          endpoints: ['/api/blog', '/api/contact', '/api/team']
        },
        triggered: true,
        acknowledged: true,
        acknowledgedBy: superAdmin.id,
        acknowledgedAt: new Date()
      }
    ]

    for (const alert of securityAlerts) {
      await prisma.securityAlert.create({
        data: {
          ...alert,
          severity: alert.severity as any
        }
      })
    }

    // Create admin security preferences
    console.log('⚙️ Creating admin security preferences...')
    
    await prisma.adminSecurityPreference.upsert({
      where: { adminId: superAdmin.id },
      update: {},
      create: {
        adminId: superAdmin.id,
        maxConcurrentSessions: 3,
        sessionTimeoutMinutes: 120,
        requireTwoFactor: false,
        allowedIpRanges: ['192.168.1.0/24', '10.0.0.0/8'],
        securityNotifications: true,
        lastSecurityReview: new Date()
      }
    })

    // Create sample consent records
    console.log('📋 Creating sample consent records...')
    
    const consentTypes = ['marketing', 'analytics', 'functional']
    const testEmails = [
      'john@doe.com',
      'user@example.com', 
      'test@adviesnconsultancy.nl'
    ]

    for (const email of testEmails) {
      for (const consentType of consentTypes) {
        await prisma.consentRecord.create({
          data: {
            email,
            consentType,
            hasConsent: Math.random() > 0.5, // Random consent
            consentSource: 'form',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        })
      }
    }

    // Create sample data processing requests
    console.log('📄 Creating sample GDPR requests...')
    
    const gdprRequests = [
      {
        email: 'john@doe.com',
        requestType: 'ACCESS_REQUEST',
        status: 'PENDING',
        requestData: { reason: 'I want to see what data you have about me' }
      },
      {
        email: 'user@example.com',
        requestType: 'DELETION_REQUEST',
        status: 'COMPLETED',
        processedBy: superAdmin.id,
        processedAt: new Date(),
        responseData: { deletedRecords: { contacts: 1, newsletters: 1 } }
      }
    ]

    for (const request of gdprRequests) {
      await prisma.dataProcessingRequest.create({
        data: {
          ...request,
          requestType: request.requestType as any,
          status: request.status as any
        }
      })
    }

    // Create data retention policies
    console.log('🗃️ Creating data retention policies...')
    
    const retentionPolicies = [
      {
        dataType: 'contact',
        retentionDays: 2555, // 7 years
        description: 'Contact form submissions retention policy',
        isActive: true
      },
      {
        dataType: 'analytics',
        retentionDays: 1095, // 3 years
        description: 'Analytics data retention policy',
        isActive: true
      },
      {
        dataType: 'logs',
        retentionDays: 365, // 1 year
        description: 'Security and audit logs retention policy',
        isActive: true
      },
      {
        dataType: 'sessions',
        retentionDays: 30, // 30 days
        description: 'Session data retention policy',
        isActive: true
      }
    ]

    for (const policy of retentionPolicies) {
      await prisma.dataRetentionPolicy.upsert({
        where: { dataType: policy.dataType },
        update: policy,
        create: policy
      })
    }

    // Create sample API health checks
    console.log('🏥 Creating API health check records...')
    
    const healthChecks = [
      { endpoint: '/api/security/health', method: 'GET', status: 200, responseTime: 45 },
      { endpoint: '/api/security/dashboard', method: 'GET', status: 200, responseTime: 120 },
      { endpoint: '/api/security/events', method: 'GET', status: 200, responseTime: 85 },
      { endpoint: '/api/security/alerts', method: 'GET', status: 200, responseTime: 65 }
    ]

    for (const check of healthChecks) {
      await prisma.apiHealthCheck.create({
        data: {
          ...check,
          checkedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // Random time in last 24h
        }
      })
    }

    console.log('✅ Week 2 Security Data seeding completed successfully!')
    console.log(`
📊 Created:
- ${apiKeyData.length} API Keys
- ${securityEvents.length} Security Events  
- ${securityAlerts.length} Security Alerts
- 1 Admin Security Preference
- ${testEmails.length * consentTypes.length} Consent Records
- ${gdprRequests.length} GDPR Requests
- ${retentionPolicies.length} Data Retention Policies
- ${healthChecks.length} API Health Checks

🔑 Super Admin Credentials:
Email: superadmin@adviesnconsultancy.nl
Password: SuperAdmin2025!
    `)

  } catch (error) {
    console.error('❌ Error seeding Week 2 security data:', error)
    throw error
  }
}

// Run the seed function
seedWeek2SecurityData()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

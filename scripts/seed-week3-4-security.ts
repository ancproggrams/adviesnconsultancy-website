
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedWeek34Security() {
  console.log('🔐 Seeding Week 3-4 security data...')

  try {
    // Create sample IP intelligence data
    await prisma.ipIntelligence.createMany({
      data: [
        {
          ipAddress: '192.168.1.1',
          reputation: 'TRUSTED',
          riskScore: 10,
          country: 'Netherlands',
          city: 'Amsterdam',
          organization: 'Local Network'
        },
        {
          ipAddress: '203.0.113.1',
          reputation: 'SUSPICIOUS',
          riskScore: 70,
          country: 'Unknown',
          organization: 'Suspicious Network',
          threatCategories: ['scanning', 'malware']
        },
        {
          ipAddress: '198.51.100.1',
          reputation: 'MALICIOUS',
          riskScore: 95,
          country: 'Unknown',
          organization: 'Botnet',
          threatCategories: ['botnet', 'ddos', 'malware'],
          isTor: true
        }
      ],
      skipDuplicates: true
    })

    // Create sample threat detections
    await prisma.threatDetection.createMany({
      data: [
        {
          type: 'BRUTE_FORCE',
          severity: 'HIGH',
          source: '203.0.113.1',
          description: 'Multiple failed login attempts detected',
          indicators: {
            attempts: 15,
            timeWindow: '5 minutes',
            targetType: 'admin login'
          },
          riskScore: 85,
          status: 'ACTIVE'
        },
        {
          type: 'ANOMALOUS_BEHAVIOR',
          severity: 'MEDIUM',
          source: 'user123',
          description: 'Unusual access patterns detected',
          indicators: {
            anomalies: ['unusual IP', 'unusual time'],
            riskScore: 0.6
          },
          riskScore: 60,
          status: 'MONITORING'
        },
        {
          type: 'MALICIOUS_IP',
          severity: 'CRITICAL',
          source: '198.51.100.1',
          description: 'Known malicious IP blocked',
          indicators: {
            reputation: 'MALICIOUS',
            threatCategories: ['botnet', 'ddos']
          },
          riskScore: 95,
          status: 'MITIGATED'
        }
      ],
      skipDuplicates: true
    })

    // Create sample security metrics
    const now = new Date()
    const metrics = []
    
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000) // Last 24 hours
      
      metrics.push(
        {
          metricType: 'attack_attempts',
          value: Math.floor(Math.random() * 10),
          timestamp,
          dimensions: { severity: 'HIGH' }
        },
        {
          metricType: 'blocked_ips',
          value: Math.floor(Math.random() * 5),
          timestamp,
          dimensions: { reputation: 'MALICIOUS' }
        },
        {
          metricType: 'user_anomalies',
          value: Math.random(),
          timestamp,
          dimensions: { type: 'behavioral' }
        }
      )
    }

    await prisma.securityMetric.createMany({
      data: metrics,
      skipDuplicates: true
    })

    // Create sample security alerts
    await prisma.securityAlert.createMany({
      data: [
        {
          type: 'THREAT_SPIKE',
          severity: 'HIGH',
          title: 'Multiple High-Severity Threats Detected',
          message: '5 high-severity threats detected in the last 15 minutes',
          metadata: { count: 5, timeWindow: '15 minutes' },
          triggered: true
        },
        {
          type: 'BRUTE_FORCE_SURGE',
          severity: 'HIGH',
          title: 'Brute Force Attack Surge',
          message: '12 brute force attempts detected',
          metadata: { count: 12 },
          triggered: true
        }
      ],
      skipDuplicates: true
    })

    // Create sample API security policies
    await prisma.apiSecurityPolicy.createMany({
      data: [
        {
          policyName: 'Admin API Security',
          description: 'Security policy for admin API endpoints',
          endpoints: ['/api/admin/*'],
          methods: ['GET', 'POST', 'PUT', 'DELETE'],
          rateLimits: {
            requests: 100,
            windowMs: 900000, // 15 minutes
            burstLimit: 20
          },
          authenticationReq: true,
          authorizationReq: true,
          inputValidation: {
            maxRequestSize: '10MB',
            allowedContentTypes: ['application/json'],
            requiresCSRF: true
          },
          outputSanitization: {
            removeServerHeaders: true,
            sanitizeErrors: true
          },
          loggingLevel: 'DETAILED',
          alertThresholds: {
            failedAuth: 5,
            rateLimitHits: 10
          },
          createdBy: 'system'
        },
        {
          policyName: 'Public API Security',
          description: 'Security policy for public API endpoints',
          endpoints: ['/api/contact', '/api/newsletter'],
          methods: ['POST'],
          rateLimits: {
            requests: 50,
            windowMs: 3600000, // 1 hour
            burstLimit: 5
          },
          authenticationReq: false,
          authorizationReq: false,
          inputValidation: {
            maxRequestSize: '1MB',
            allowedContentTypes: ['application/json'],
            requiresCSRF: false
          },
          outputSanitization: {
            removeServerHeaders: true,
            sanitizeErrors: true
          },
          loggingLevel: 'STANDARD',
          alertThresholds: {
            rateLimitHits: 20
          },
          createdBy: 'system'
        }
      ],
      skipDuplicates: true
    })

    // Create sample security automation workflows
    await prisma.securityAutomation.createMany({
      data: [
        {
          workflowName: 'Auto Block Malicious IPs',
          description: 'Automatically block IPs with high risk scores',
          triggerConditions: {
            eventTypes: ['MALICIOUS_IP_DETECTED'],
            riskScore: { gte: 80 }
          },
          actions: {
            actions: [
              {
                type: 'BLOCK_IP',
                duration: 3600000 // 1 hour
              },
              {
                type: 'ALERT_ADMIN',
                severity: 'HIGH'
              }
            ]
          },
          configuration: {
            enabled: true,
            cooldownPeriod: 300000 // 5 minutes
          },
          createdBy: 'system'
        },
        {
          workflowName: 'Incident Response for Critical Threats',
          description: 'Create incidents for critical security threats',
          triggerConditions: {
            eventTypes: ['BRUTE_FORCE_ATTACK', 'ADVANCED_PERSISTENT_THREAT'],
            severity: 'CRITICAL'
          },
          actions: {
            actions: [
              {
                type: 'CREATE_INCIDENT',
                priority: 'CRITICAL'
              },
              {
                type: 'ALERT_ADMIN',
                severity: 'CRITICAL'
              },
              {
                type: 'QUARANTINE_USER',
                duration: 3600000 // 1 hour
              }
            ]
          },
          configuration: {
            enabled: true,
            autoExecute: true
          },
          createdBy: 'system'
        }
      ],
      skipDuplicates: true
    })

    // Create sample data classifications
    await prisma.dataClassification.createMany({
      data: [
        {
          resourceType: 'contact',
          resourceId: 'personal_data',
          classification: 'CONFIDENTIAL',
          sensitivity: 'high',
          retentionPeriod: 2555, // 7 years
          accessControls: {
            allowedRoles: ['ADMIN', 'SUPER_ADMIN'],
            restrictions: ['need_to_know', 'audit_required']
          },
          encryptionReq: true,
          auditRequired: true,
          classifiedBy: 'system',
          reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
        },
        {
          resourceType: 'admin_data',
          resourceId: 'system_config',
          classification: 'RESTRICTED',
          sensitivity: 'critical',
          retentionPeriod: 3653, // 10 years
          accessControls: {
            allowedRoles: ['SUPER_ADMIN'],
            restrictions: ['explicit_approval', 'dual_control']
          },
          encryptionReq: true,
          auditRequired: true,
          classifiedBy: 'system',
          reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      ],
      skipDuplicates: true
    })

    // Create sample privacy impact assessment
    await prisma.privacyImpactAssessment.create({
      data: {
        title: 'Contact Form Data Processing PIA',
        description: 'Privacy impact assessment for contact form data collection and processing',
        dataTypes: ['name', 'email', 'company', 'phone', 'message'],
        processingPurpose: 'Customer inquiry handling and business communication',
        legalBasis: 'Legitimate interest (Article 6(1)(f) GDPR)',
        dataSubjects: ['website visitors', 'potential customers', 'existing customers'],
        riskLevel: 'MEDIUM',
        mitigationMeasures: {
          technicalMeasures: [
            'Data encryption at rest and in transit',
            'Access controls and authentication',
            'Regular security monitoring'
          ],
          organizationalMeasures: [
            'Privacy training for staff',
            'Data processing agreements',
            'Regular compliance reviews'
          ]
        },
        dataRetentionPeriod: 1095, // 3 years
        sharingWithThirdParties: false,
        dpoApproval: true,
        approvedBy: 'system',
        approvedAt: new Date(),
        nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        status: 'APPROVED',
        createdBy: 'system'
      }
    })

    console.log('✅ Week 3-4 security data seeded successfully')
    
  } catch (error) {
    console.error('❌ Error seeding Week 3-4 security data:', error)
    throw error
  }
}

export default seedWeek34Security

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedWeek34Security()
    .then(() => prisma.$disconnect())
    .catch((error) => {
      console.error(error)
      prisma.$disconnect()
      process.exit(1)
    })
}

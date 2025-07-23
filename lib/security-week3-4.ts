
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'
import speakeasy from 'speakeasy'

// ==== WEEK 3-4 ADVANCED THREAT DETECTION ====

export class AdvancedThreatDetection {
  // IP Intelligence & Reputation System
  static async checkIpReputation(ipAddress: string): Promise<{
    reputation: string
    riskScore: number
    shouldBlock: boolean
    metadata: any
  }> {
    let intel = await prisma.ipIntelligence.findUnique({
      where: { ipAddress }
    })

    if (!intel) {
      // Create new IP intelligence record
      intel = await this.gatherIpIntelligence(ipAddress)
    } else if (intel.lastChecked < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      // Update if last check was more than 24 hours ago
      intel = await this.updateIpIntelligence(ipAddress, intel)
    }

    const shouldBlock = intel.reputation === 'MALICIOUS' || 
                       intel.reputation === 'BLOCKED' ||
                       intel.riskScore >= 80

    return {
      reputation: intel.reputation,
      riskScore: intel.riskScore,
      shouldBlock,
      metadata: {
        country: intel.country,
        city: intel.city,
        organization: intel.organization,
        isTor: intel.isTor,
        isVpn: intel.isVpn,
        isDatacenter: intel.isDatacenter,
        threatCategories: intel.threatCategories
      }
    }
  }

  private static async gatherIpIntelligence(ipAddress: string) {
    // Simulate IP intelligence gathering (in production, integrate with threat intel APIs)
    const riskScore = this.calculateInitialRiskScore(ipAddress)
    const reputation = this.determineReputation(riskScore)
    
    return await prisma.ipIntelligence.create({
      data: {
        ipAddress,
        reputation: reputation as any,
        riskScore,
        country: this.detectCountry(ipAddress),
        city: this.detectCity(ipAddress),
        organization: this.detectOrganization(ipAddress),
        isTor: this.detectTor(ipAddress),
        isVpn: this.detectVpn(ipAddress),
        isDatacenter: this.detectDatacenter(ipAddress),
        threatCategories: this.detectThreatCategories(ipAddress)
      }
    })
  }

  private static async updateIpIntelligence(ipAddress: string, existing: any) {
    const newRiskScore = this.recalculateRiskScore(existing, ipAddress)
    const newReputation = this.determineReputation(newRiskScore)
    
    return await prisma.ipIntelligence.update({
      where: { ipAddress },
      data: {
        reputation: newReputation as any,
        riskScore: newRiskScore,
        lastChecked: new Date(),
        checkedCount: { increment: 1 }
      }
    })
  }

  private static calculateInitialRiskScore(ipAddress: string): number {
    // Simple risk scoring based on IP patterns
    let score = 0
    
    // Check for suspicious patterns
    if (ipAddress.startsWith('10.') || ipAddress.startsWith('192.168.') || ipAddress.startsWith('172.')) {
      score += 10 // Private network
    }
    
    // Add more sophisticated scoring logic here
    return Math.min(score, 100)
  }

  private static recalculateRiskScore(existing: any, ipAddress: string): number {
    let score = existing.riskScore
    
    // Adjust score based on recent activities
    // This would integrate with security events
    
    return Math.min(Math.max(score, 0), 100)
  }

  private static determineReputation(riskScore: number): string {
    if (riskScore >= 90) return 'MALICIOUS'
    if (riskScore >= 70) return 'SUSPICIOUS'
    if (riskScore >= 30) return 'UNKNOWN'
    if (riskScore >= 10) return 'NEUTRAL'
    return 'TRUSTED'
  }

  private static detectCountry(ipAddress: string): string | null {
    // Simulate geolocation (integrate with MaxMind or similar)
    return 'Netherlands'
  }

  private static detectCity(ipAddress: string): string | null {
    return 'Amsterdam'
  }

  private static detectOrganization(ipAddress: string): string | null {
    return 'Cloud Provider'
  }

  private static detectTor(ipAddress: string): boolean {
    // Check against Tor exit node lists
    return false
  }

  private static detectVpn(ipAddress: string): boolean {
    // Check against VPN provider IP ranges
    return false
  }

  private static detectDatacenter(ipAddress: string): boolean {
    // Check against datacenter IP ranges
    return true
  }

  private static detectThreatCategories(ipAddress: string): string[] {
    // Check against threat intelligence feeds
    return []
  }

  // Brute Force Attack Detection
  static async detectBruteForce(
    ipAddress: string,
    targetType: string,
    targetId?: string
  ): Promise<{ isBlocked: boolean; attempts: number; blockExpiresAt?: Date }> {
    const windowStart = new Date(Date.now() - 15 * 60 * 1000) // 15 minutes
    const windowEnd = new Date()

    let attempt = await prisma.bruteForceAttempt.findFirst({
      where: {
        ipAddress,
        targetType,
        targetId,
        windowStart: { lte: windowEnd },
        windowEnd: { gte: windowStart }
      }
    })

    if (!attempt) {
      // Create new attempt record
      attempt = await prisma.bruteForceAttempt.create({
        data: {
          ipAddress,
          targetType,
          targetId,
          attempts: 1,
          windowStart,
          windowEnd
        }
      })
    } else {
      // Increment attempt count
      attempt = await prisma.bruteForceAttempt.update({
        where: { id: attempt.id },
        data: {
          attempts: { increment: 1 },
          windowEnd
        }
      })
    }

    // Check if should be blocked
    const threshold = this.getBruteForceThreshold(targetType)
    const shouldBlock = attempt.attempts >= threshold && !attempt.isBlocked

    if (shouldBlock) {
      const blockDuration = this.getBlockDuration(attempt.attempts)
      const blockExpiresAt = new Date(Date.now() + blockDuration)

      await prisma.bruteForceAttempt.update({
        where: { id: attempt.id },
        data: {
          isBlocked: true,
          blockExpiresAt
        }
      })

      // Create threat detection record
      await this.createThreatDetection(
        'BRUTE_FORCE',
        'HIGH',
        ipAddress,
        `Brute force attack detected: ${attempt.attempts} attempts`,
        { targetType, targetId, attempts: attempt.attempts }
      )

      return { isBlocked: true, attempts: attempt.attempts, blockExpiresAt }
    }

    return { isBlocked: attempt.isBlocked && attempt.blockExpiresAt! > new Date(), attempts: attempt.attempts }
  }

  private static getBruteForceThreshold(targetType: string): number {
    switch (targetType) {
      case 'login': return 5
      case 'api': return 20
      case 'admin': return 3
      default: return 10
    }
  }

  private static getBlockDuration(attempts: number): number {
    // Exponential backoff: 15min, 30min, 1h, 2h, 4h, 8h, 24h
    const baseDuration = 15 * 60 * 1000 // 15 minutes
    const multiplier = Math.min(Math.pow(2, attempts - 5), 96) // Max 24 hours
    return baseDuration * multiplier
  }

  // Anomaly Detection for User Behavior
  static async detectUserAnomalies(
    userId: string,
    userType: string,
    currentActivity: {
      ipAddress: string
      userAgent: string
      location?: string
      sessionDuration?: number
      accessTime?: Date
    }
  ): Promise<{ anomalous: boolean; anomalies: string[]; riskScore: number }> {
    let profile = await prisma.userAnomalyProfile.findUnique({
      where: { 
        userId_userType: {
          userId,
          userType
        }
      }
    })

    if (!profile || !profile.baselineEstablished) {
      // Create or update baseline
      profile = await this.buildUserBaseline(userId, userType, currentActivity)
      return { anomalous: false, anomalies: [], riskScore: 0 }
    }

    const anomalies: string[] = []
    let riskScore = 0

    // Check IP address anomaly
    if (!profile.commonIpAddresses.includes(currentActivity.ipAddress)) {
      anomalies.push('Unusual IP address')
      riskScore += 0.3
    }

    // Check user agent anomaly
    if (!profile.commonUserAgents.includes(currentActivity.userAgent)) {
      anomalies.push('Unusual browser/device')
      riskScore += 0.2
    }

    // Check location anomaly
    if (currentActivity.location && !profile.commonLocations.includes(currentActivity.location)) {
      anomalies.push('Unusual location')
      riskScore += 0.4
    }

    // Check time-based anomaly
    if (this.isUnusualAccessTime(currentActivity.accessTime || new Date(), profile.commonAccessTimes)) {
      anomalies.push('Unusual access time')
      riskScore += 0.1
    }

    const isAnomalous = riskScore >= profile.anomalyThreshold

    if (isAnomalous) {
      await this.createThreatDetection(
        'ANOMALOUS_BEHAVIOR',
        riskScore >= 0.8 ? 'HIGH' : 'MEDIUM',
        currentActivity.ipAddress,
        `User behavior anomalies detected: ${anomalies.join(', ')}`,
        { userId, userType, anomalies, riskScore }
      )
    }

    // Update profile with new data
    await this.updateUserBaseline(profile.id, currentActivity)

    return { anomalous: isAnomalous, anomalies, riskScore }
  }

  private static async buildUserBaseline(
    userId: string,
    userType: string,
    currentActivity: any
  ) {
    // Get historical session data
    const historicalSessions = await prisma.sessionActivity.findMany({
      where: { adminId: userId },
      take: 50,
      orderBy: { timestamp: 'desc' }
    })

    const commonIps = [...new Set(historicalSessions.map(s => s.ipAddress))]
    const commonUserAgents = [...new Set(historicalSessions.map(s => s.userAgent))]
    const commonLocations = [...new Set(historicalSessions.map(s => s.location).filter(Boolean))]

    return await prisma.userAnomalyProfile.upsert({
      where: {
        userId_userType: { userId, userType }
      },
      create: {
        userId,
        userType,
        baselineEstablished: true,
        commonIpAddresses: [currentActivity.ipAddress, ...commonIps].slice(0, 10),
        commonUserAgents: [currentActivity.userAgent, ...commonUserAgents].slice(0, 5),
        commonLocations: currentActivity.location ? [currentActivity.location, ...commonLocations].slice(0, 5) : commonLocations,
        commonAccessTimes: this.extractAccessPatterns(historicalSessions)
      },
      update: {
        baselineEstablished: true,
        lastUpdated: new Date()
      }
    })
  }

  private static async updateUserBaseline(profileId: string, activity: any) {
    const profile = await prisma.userAnomalyProfile.findUnique({ where: { id: profileId } })
    if (!profile) return

    // Add new data to baseline (keeping recent patterns)
    await prisma.userAnomalyProfile.update({
      where: { id: profileId },
      data: {
        commonIpAddresses: [activity.ipAddress, ...profile.commonIpAddresses].slice(0, 10),
        commonUserAgents: [activity.userAgent, ...profile.commonUserAgents].slice(0, 5),
        commonLocations: activity.location ? 
          [activity.location, ...profile.commonLocations].slice(0, 5) : 
          profile.commonLocations,
        lastUpdated: new Date()
      }
    })
  }

  private static extractAccessPatterns(sessions: any[]): any {
    const patterns = {
      hourlyDistribution: new Array(24).fill(0),
      weeklyDistribution: new Array(7).fill(0)
    }

    sessions.forEach(session => {
      const date = new Date(session.timestamp)
      patterns.hourlyDistribution[date.getHours()]++
      patterns.weeklyDistribution[date.getDay()]++
    })

    return patterns
  }

  private static isUnusualAccessTime(accessTime: Date, patterns: any): boolean {
    if (!patterns) return false
    
    const hour = accessTime.getHours()
    const day = accessTime.getDay()
    
    // Check if this hour/day combination is uncommon for the user
    const hourlyThreshold = Math.max(patterns.hourlyDistribution[hour] || 0, 1)
    const weeklyThreshold = Math.max(patterns.weeklyDistribution[day] || 0, 1)
    
    return hourlyThreshold < 2 && weeklyThreshold < 2
  }

  // Create threat detection record
  static async createThreatDetection(
    type: string,
    severity: string,
    source: string,
    description: string,
    indicators: any
  ) {
    return await prisma.threatDetection.create({
      data: {
        type: type as any,
        severity: severity as any,
        source,
        description,
        indicators,
        riskScore: this.calculateThreatRiskScore(type, severity, indicators)
      }
    })
  }

  private static calculateThreatRiskScore(type: string, severity: string, indicators: any): number {
    let score = 0
    
    // Base score by type
    switch (type) {
      case 'BRUTE_FORCE': score = 60; break
      case 'ANOMALOUS_BEHAVIOR': score = 40; break
      case 'MALICIOUS_IP': score = 80; break
      default: score = 30
    }
    
    // Severity multiplier
    switch (severity) {
      case 'CRITICAL': score *= 1.5; break
      case 'HIGH': score *= 1.2; break
      case 'MEDIUM': score *= 1.0; break
      case 'LOW': score *= 0.8; break
    }
    
    return Math.min(Math.round(score), 100)
  }
}

// ==== ADVANCED MONITORING & ALERTING ====

export class SecurityMonitoring {
  // Real-time Security Metrics Collection
  static async recordMetric(
    metricType: string,
    value: number,
    dimensions?: any
  ) {
    await prisma.securityMetric.create({
      data: {
        metricType,
        value,
        dimensions
      }
    })
  }

  // Get Security Dashboard Data
  static async getSecurityDashboard() {
    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [
      activeThreatCount,
      recentThreats,
      threatsByType,
      threatsBySeverity,
      ipReputationStats,
      bruteForceStats,
      activeIncidents,
      recentMetrics,
      securityAlerts,
      complianceStatus
    ] = await Promise.all([
      prisma.threatDetection.count({
        where: { 
          status: { in: ['ACTIVE', 'MONITORING'] },
          firstDetected: { gte: last24Hours }
        }
      }),
      prisma.threatDetection.findMany({
        where: { firstDetected: { gte: last24Hours } },
        orderBy: { firstDetected: 'desc' },
        take: 10
      }),
      prisma.threatDetection.groupBy({
        by: ['type'],
        where: { firstDetected: { gte: last7Days } },
        _count: true
      }),
      prisma.threatDetection.groupBy({
        by: ['severity'],
        where: { firstDetected: { gte: last7Days } },
        _count: true
      }),
      prisma.ipIntelligence.groupBy({
        by: ['reputation'],
        _count: true
      }),
      prisma.bruteForceAttempt.aggregate({
        where: { createdAt: { gte: last24Hours } },
        _sum: { attempts: true },
        _count: true
      }),
      prisma.incidentResponse.findMany({
        where: { 
          status: { in: ['PENDING', 'INVESTIGATING', 'RESPONDING'] }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.securityMetric.findMany({
        where: { timestamp: { gte: last24Hours } },
        orderBy: { timestamp: 'desc' },
        take: 100
      }),
      prisma.securityAlert.findMany({
        where: { 
          triggered: true,
          acknowledged: false,
          createdAt: { gte: last7Days }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.getComplianceStatus()
    ])

    // Process metrics for time series
    const metricsTimeSeries = this.processMetricsTimeSeries(recentMetrics)

    return {
      overview: {
        activeThreatCount,
        activeIncidentCount: activeIncidents.length,
        activeAlertCount: securityAlerts.length,
        complianceScore: complianceStatus.overallScore
      },
      threats: {
        recent: recentThreats,
        byType: threatsByType,
        bySeverity: threatsBySeverity
      },
      ipIntelligence: ipReputationStats,
      bruteForce: {
        totalAttempts: bruteForceStats._sum.attempts || 0,
        uniqueIps: bruteForceStats._count
      },
      incidents: activeIncidents,
      alerts: securityAlerts,
      metrics: metricsTimeSeries,
      compliance: complianceStatus
    }
  }

  private static processMetricsTimeSeries(metrics: any[]) {
    const timeSeries: Record<string, any[]> = {}
    
    metrics.forEach(metric => {
      if (!timeSeries[metric.metricType]) {
        timeSeries[metric.metricType] = []
      }
      timeSeries[metric.metricType].push({
        timestamp: metric.timestamp,
        value: metric.value,
        dimensions: metric.dimensions
      })
    })
    
    return timeSeries
  }

  private static async getComplianceStatus() {
    const now = new Date()
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [
      gdprRequests,
      auditLogs,
      dataClassifications,
      privacyAssessments
    ] = await Promise.all([
      prisma.dataProcessingRequest.count({
        where: { 
          createdAt: { gte: last30Days },
          status: { in: ['PENDING', 'IN_PROGRESS'] }
        }
      }),
      prisma.complianceAuditLog.count({
        where: { timestamp: { gte: last30Days } }
      }),
      prisma.dataClassification.count(),
      prisma.privacyImpactAssessment.count({
        where: { status: 'APPROVED' }
      })
    ])

    const overallScore = this.calculateComplianceScore({
      pendingRequests: gdprRequests,
      auditCoverage: auditLogs,
      classifiedData: dataClassifications,
      approvedPIAs: privacyAssessments
    })

    return {
      overallScore,
      pendingGdprRequests: gdprRequests,
      auditLogCount: auditLogs,
      classifiedDataCount: dataClassifications,
      approvedPiaCount: privacyAssessments
    }
  }

  private static calculateComplianceScore(data: any): number {
    let score = 100
    
    // Deduct points for pending requests
    score -= Math.min(data.pendingRequests * 5, 30)
    
    // Add points for good practices
    if (data.auditCoverage > 100) score += 5
    if (data.classifiedData > 50) score += 5
    if (data.approvedPIAs > 5) score += 10
    
    return Math.max(Math.min(score, 100), 0)
  }

  // Automated Alerting System
  static async checkAlertConditions() {
    const now = new Date()
    const last15Minutes = new Date(now.getTime() - 15 * 60 * 1000)

    // Check for high-severity threats
    const recentHighThreats = await prisma.threatDetection.count({
      where: {
        severity: { in: ['HIGH', 'CRITICAL'] },
        firstDetected: { gte: last15Minutes }
      }
    })

    if (recentHighThreats > 3) {
      await this.createAlert(
        'THREAT_SPIKE',
        'HIGH',
        'Multiple High-Severity Threats Detected',
        `${recentHighThreats} high-severity threats detected in the last 15 minutes`,
        { count: recentHighThreats, timeWindow: '15 minutes' }
      )
    }

    // Check for brute force patterns
    const recentBruteForce = await prisma.bruteForceAttempt.count({
      where: {
        createdAt: { gte: last15Minutes },
        attempts: { gte: 5 }
      }
    })

    if (recentBruteForce > 10) {
      await this.createAlert(
        'BRUTE_FORCE_SURGE',
        'HIGH',
        'Brute Force Attack Surge',
        `${recentBruteForce} brute force attempts detected`,
        { count: recentBruteForce }
      )
    }

    // Check for failed compliance requirements
    const pendingGdprRequests = await prisma.dataProcessingRequest.count({
      where: {
        status: 'PENDING',
        createdAt: { lte: new Date(now.getTime() - 72 * 60 * 60 * 1000) } // 72 hours old
      }
    })

    if (pendingGdprRequests > 0) {
      await this.createAlert(
        'COMPLIANCE_BREACH',
        'CRITICAL',
        'GDPR Request Deadline Approaching',
        `${pendingGdprRequests} GDPR requests are overdue`,
        { count: pendingGdprRequests }
      )
    }
  }

  public static async createAlert(
    type: string,
    severity: string,
    title: string,
    message: string,
    metadata?: any
  ) {
    return await prisma.securityAlert.create({
      data: {
        type,
        severity: severity as any,
        title,
        message,
        metadata,
        triggered: true
      }
    })
  }
}

// ==== AUTOMATED INCIDENT RESPONSE ====

export class IncidentResponse {
  static async createIncident(
    triggerEventId: string,
    responseType: string,
    priority: string,
    title: string,
    description: string,
    actionsPlan: any
  ) {
    const incident = await prisma.incidentResponse.create({
      data: {
        triggerEventId,
        responseType: responseType as any,
        priority: priority as any,
        title,
        description,
        actionsPlan,
        timeToDetection: 0 // Will be updated based on event timestamp
      }
    })

    // Execute automated actions
    await this.executeAutomatedActions(incident.id, actionsPlan)

    return incident
  }

  private static async executeAutomatedActions(incidentId: string, actionsPlan: any) {
    const executedActions = []

    for (const action of actionsPlan.actions || []) {
      try {
        switch (action.type) {
          case 'BLOCK_IP':
            await this.blockIpAddress(action.ipAddress, action.duration)
            executedActions.push({ ...action, status: 'SUCCESS', timestamp: new Date() })
            break
          
          case 'QUARANTINE_USER':
            await this.quarantineUser(action.userId, action.reason)
            executedActions.push({ ...action, status: 'SUCCESS', timestamp: new Date() })
            break
          
          case 'ALERT_ADMIN':
            await this.alertAdministrator(action.adminId, action.message)
            executedActions.push({ ...action, status: 'SUCCESS', timestamp: new Date() })
            break
          
          case 'RATE_LIMIT':
            await this.applyRateLimit(action.target, action.limit)
            executedActions.push({ ...action, status: 'SUCCESS', timestamp: new Date() })
            break
          
          default:
            executedActions.push({ ...action, status: 'SKIPPED', reason: 'Unknown action type' })
        }
      } catch (error) {
        executedActions.push({ 
          ...action, 
          status: 'FAILED', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    }

    // Update incident with executed actions
    await prisma.incidentResponse.update({
      where: { id: incidentId },
      data: { executedActions }
    })
  }

  private static async blockIpAddress(ipAddress: string, duration: number) {
    // Update IP intelligence to block
    await prisma.ipIntelligence.upsert({
      where: { ipAddress },
      create: {
        ipAddress,
        reputation: 'BLOCKED',
        riskScore: 100,
        metadata: { blockedByIncident: true, blockDuration: duration }
      },
      update: {
        reputation: 'BLOCKED',
        riskScore: 100,
        metadata: { blockedByIncident: true, blockDuration: duration }
      }
    })
  }

  private static async quarantineUser(userId: string, reason: string) {
    // Deactivate user sessions
    await prisma.activeSession.updateMany({
      where: { adminId: userId, isActive: true },
      data: { isActive: false }
    })

    // Lock admin account temporarily
    await prisma.admin.update({
      where: { id: userId },
      data: {
        lockoutUntil: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        isActive: false
      }
    })
  }

  private static async alertAdministrator(adminId: string, message: string) {
    // Create security notification
    await prisma.securityNotification.create({
      data: {
        userId: adminId,
        userType: 'admin',
        type: 'SECURITY_ALERT',
        title: 'Automated Security Response',
        message,
        severity: 'HIGH'
      }
    })
  }

  private static async applyRateLimit(target: string, limit: any) {
    // This would integrate with the rate limiting system
    console.log(`Applied rate limit to ${target}:`, limit)
  }
}

// ==== TWO-FACTOR AUTHENTICATION ====

export class TwoFactorAuthentication {
  static async setupTOTP(userId: string, userType: string) {
    const secret = speakeasy.generateSecret({
      name: `ABC Security (${userType})`,
      issuer: 'ABC Advies & Consultancy'
    })

    await prisma.twoFactorAuth.upsert({
      where: {
        userId_userType_method: {
          userId,
          userType,
          method: 'totp'
        }
      },
      create: {
        userId,
        userType,
        method: 'totp',
        secret: secret.base32,
        backupCodes: this.generateBackupCodes()
      },
      update: {
        secret: secret.base32,
        isVerified: false,
        backupCodes: this.generateBackupCodes()
      }
    })

    return {
      secret: secret.base32,
      qrCode: secret.otpauth_url
    }
  }

  static async verifyTOTP(
    userId: string,
    userType: string,
    token: string
  ): Promise<{ verified: boolean; error?: string }> {
    const tfa = await prisma.twoFactorAuth.findUnique({
      where: {
        userId_userType_method: {
          userId,
          userType,
          method: 'totp'
        }
      }
    })

    if (!tfa || !tfa.secret) {
      return { verified: false, error: 'TOTP not set up' }
    }

    if (tfa.lockedUntil && tfa.lockedUntil > new Date()) {
      return { verified: false, error: 'Account temporarily locked' }
    }

    const verified = speakeasy.totp.verify({
      secret: tfa.secret,
      encoding: 'base32',
      token,
      window: 2 // Allow 2 time steps (±60 seconds)
    })

    if (verified) {
      await prisma.twoFactorAuth.update({
        where: { id: tfa.id },
        data: {
          isVerified: true,
          lastUsed: new Date(),
          failedAttempts: 0,
          lockedUntil: null
        }
      })
      return { verified: true }
    } else {
      const newFailedAttempts = tfa.failedAttempts + 1
      const shouldLock = newFailedAttempts >= 5
      
      await prisma.twoFactorAuth.update({
        where: { id: tfa.id },
        data: {
          failedAttempts: newFailedAttempts,
          lockedUntil: shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null
        }
      })

      return { 
        verified: false, 
        error: shouldLock ? 'Too many failed attempts. Account locked.' : 'Invalid token' 
      }
    }
  }

  static async verifyBackupCode(
    userId: string,
    userType: string,
    code: string
  ): Promise<{ verified: boolean; error?: string }> {
    const tfa = await prisma.twoFactorAuth.findFirst({
      where: { userId, userType }
    })

    if (!tfa || !tfa.backupCodes.includes(code)) {
      return { verified: false, error: 'Invalid backup code' }
    }

    // Remove used backup code
    const updatedCodes = tfa.backupCodes.filter((c: string) => c !== code)
    
    await prisma.twoFactorAuth.update({
      where: { id: tfa.id },
      data: {
        backupCodes: updatedCodes,
        lastUsed: new Date()
      }
    })

    return { verified: true }
  }

  private static generateBackupCodes(): string[] {
    const codes = []
    for (let i = 0; i < 8; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase())
    }
    return codes
  }
}

// ==== SECURITY NOTIFICATIONS ====

export class SecurityNotifications {
  static async sendLoginNotification(
    userId: string,
    userType: string,
    ipAddress: string,
    userAgent: string,
    location?: string
  ) {
    const preferences = await this.getUserPreferences(userId, userType)
    
    if (!preferences?.loginNotifications) return

    await prisma.securityNotification.create({
      data: {
        userId,
        userType,
        type: 'LOGIN_NOTIFICATION',
        title: 'New Login Detected',
        message: `Login from ${location || 'Unknown location'} using ${userAgent}`,
        severity: 'LOW',
        metadata: { ipAddress, userAgent, location }
      }
    })
  }

  static async sendSuspiciousActivityAlert(
    userId: string,
    userType: string,
    activities: string[],
    riskScore: number
  ) {
    const preferences = await this.getUserPreferences(userId, userType)
    
    if (!preferences?.unusualActivityAlerts) return

    const severity = riskScore >= 0.8 ? 'HIGH' : riskScore >= 0.5 ? 'MEDIUM' : 'LOW'

    await prisma.securityNotification.create({
      data: {
        userId,
        userType,
        type: 'SUSPICIOUS_ACTIVITY',
        title: 'Suspicious Activity Detected',
        message: `Unusual activities detected: ${activities.join(', ')}`,
        severity: severity as any,
        metadata: { activities, riskScore },
        actionUrl: '/security/activity'
      }
    })
  }

  static async sendPasswordChangeReminder(userId: string, userType: string) {
    const preferences = await this.getUserPreferences(userId, userType)
    
    if (!preferences?.passwordChangeReminders) return

    await prisma.securityNotification.create({
      data: {
        userId,
        userType,
        type: 'PASSWORD_CHANGE',
        title: 'Password Change Recommended',
        message: 'It\'s been a while since you last changed your password. Consider updating it for better security.',
        severity: 'LOW',
        actionUrl: '/security/password'
      }
    })
  }

  private static async getUserPreferences(userId: string, userType: string) {
    return await prisma.userSecurityPreference.findUnique({
      where: {
        userId_userType: { userId, userType }
      }
    })
  }

  static async getNotifications(userId: string, userType: string, unreadOnly: boolean = false) {
    return await prisma.securityNotification.findMany({
      where: {
        userId,
        userType,
        ...(unreadOnly && { isRead: false }),
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
  }

  static async markNotificationRead(notificationId: string) {
    return await prisma.securityNotification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() }
    })
  }
}

// ==== COMPLIANCE & AUDIT HARDENING ====

export class ComplianceManager {
  static async logComplianceAction(
    complianceType: string,
    action: string,
    resource: string,
    resourceId: string,
    performedBy: string,
    ipAddress: string,
    userAgent: string,
    oldValues?: any,
    newValues?: any,
    businessJustification?: string
  ) {
    return await prisma.complianceAuditLog.create({
      data: {
        complianceType,
        action,
        resource,
        resourceId,
        oldValues,
        newValues,
        performedBy,
        ipAddress,
        userAgent,
        businessJustification,
        classification: this.determineDataClassification(resource, newValues)
      }
    })
  }

  private static determineDataClassification(resource: string, data: any): any {
    // Classify data based on content
    if (resource.includes('personal') || resource.includes('contact')) {
      return 'CONFIDENTIAL'
    }
    if (resource.includes('internal') || resource.includes('admin')) {
      return 'INTERNAL'
    }
    return 'INTERNAL'
  }

  static async classifyData(
    resourceType: string,
    resourceId: string,
    classification: string,
    sensitivity: string,
    retentionPeriod: number,
    classifiedBy: string
  ) {
    const reviewDate = new Date()
    reviewDate.setFullYear(reviewDate.getFullYear() + 1) // Annual review

    return await prisma.dataClassification.create({
      data: {
        resourceType,
        resourceId,
        classification: classification as any,
        sensitivity,
        retentionPeriod,
        classifiedBy,
        reviewDate,
        accessControls: this.getDefaultAccessControls(classification),
        encryptionReq: ['CONFIDENTIAL', 'RESTRICTED', 'TOP_SECRET'].includes(classification),
        auditRequired: ['RESTRICTED', 'TOP_SECRET'].includes(classification)
      }
    })
  }

  private static getDefaultAccessControls(classification: string): any {
    switch (classification) {
      case 'PUBLIC':
        return { allowedRoles: ['*'], restrictions: [] }
      case 'INTERNAL':
        return { allowedRoles: ['ADMIN', 'EDITOR'], restrictions: ['internal_only'] }
      case 'CONFIDENTIAL':
        return { allowedRoles: ['SUPER_ADMIN', 'ADMIN'], restrictions: ['need_to_know'] }
      case 'RESTRICTED':
        return { allowedRoles: ['SUPER_ADMIN'], restrictions: ['explicit_approval'] }
      case 'TOP_SECRET':
        return { allowedRoles: ['SUPER_ADMIN'], restrictions: ['explicit_approval', 'dual_control'] }
      default:
        return { allowedRoles: ['ADMIN'], restrictions: [] }
    }
  }

  static async createPrivacyImpactAssessment(
    title: string,
    description: string,
    dataTypes: string[],
    processingPurpose: string,
    legalBasis: string,
    dataSubjects: string[],
    riskLevel: string,
    mitigationMeasures: any,
    dataRetentionPeriod: number,
    sharingWithThirdParties: boolean,
    thirdParties: any,
    createdBy: string
  ) {
    const nextReviewDate = new Date()
    nextReviewDate.setFullYear(nextReviewDate.getFullYear() + 1)

    return await prisma.privacyImpactAssessment.create({
      data: {
        title,
        description,
        dataTypes,
        processingPurpose,
        legalBasis,
        dataSubjects,
        riskLevel,
        mitigationMeasures,
        dataRetentionPeriod,
        sharingWithThirdParties,
        thirdParties,
        nextReviewDate,
        createdBy
      }
    })
  }
}

// ==== SECURITY AUTOMATION ====

export class SecurityAutomation {
  static async createAutomation(
    workflowName: string,
    description: string,
    triggerConditions: any,
    actions: any,
    configuration: any,
    createdBy: string
  ) {
    return await prisma.securityAutomation.create({
      data: {
        workflowName,
        description,
        triggerConditions,
        actions,
        configuration,
        createdBy
      }
    })
  }

  static async executeAutomations(eventType: string, eventData: any) {
    const activeAutomations = await prisma.securityAutomation.findMany({
      where: { status: 'ACTIVE' }
    })

    for (const automation of activeAutomations) {
      if (this.shouldTrigger(automation.triggerConditions, eventType, eventData)) {
        await this.executeAutomation(automation.id)
      }
    }
  }

  private static shouldTrigger(conditions: any, eventType: string, eventData: any): boolean {
    return conditions.eventTypes?.includes(eventType) || 
           conditions.riskScore <= eventData.riskScore ||
           conditions.severity === eventData.severity
  }

  private static async executeAutomation(automationId: string) {
    const startTime = Date.now()
    
    try {
      const automation = await prisma.securityAutomation.findUnique({
        where: { id: automationId }
      })
      
      if (!automation) return

      // Execute actions
      const actions = automation.actions as any
      if (actions && typeof actions === 'object' && Array.isArray(actions.actions)) {
        for (const action of actions.actions) {
          await this.executeAction(action)
        }
      }

      const runtime = Date.now() - startTime
      
      await prisma.securityAutomation.update({
        where: { id: automationId },
        data: {
          lastExecuted: new Date(),
          executionCount: { increment: 1 },
          successCount: { increment: 1 },
          averageRuntime: Math.round((automation.averageRuntime || 0 + runtime) / 2)
        }
      })
    } catch (error) {
      await prisma.securityAutomation.update({
        where: { id: automationId },
        data: {
          failureCount: { increment: 1 }
        }
      })
    }
  }

  private static async executeAction(action: any) {
    switch (action.type) {
      case 'CREATE_ALERT':
        await SecurityMonitoring.createAlert(
          action.alertType,
          action.severity,
          action.title,
          action.message,
          action.metadata
        )
        break
      
      case 'BLOCK_IP':
        await AdvancedThreatDetection.createThreatDetection(
          'MALICIOUS_IP',
          'HIGH',
          action.ipAddress,
          'IP blocked by automation',
          { automated: true, reason: action.reason }
        )
        break
      
      // Add more action types as needed
    }
  }
}

export default {
  AdvancedThreatDetection,
  SecurityMonitoring,
  IncidentResponse,
  TwoFactorAuthentication,
  SecurityNotifications,
  ComplianceManager,
  SecurityAutomation
}

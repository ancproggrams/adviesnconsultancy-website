

'use client'

import analytics from './analytics'

export interface LeadScoringRule {
  id: string
  name: string
  description: string
  trigger: string
  points: number
  maxOccurrences?: number
  cooldownMinutes?: number
  isActive: boolean
}

export interface LeadActivity {
  id: string
  userId: string
  ruleId: string
  points: number
  timestamp: Date
  metadata?: Record<string, any>
}

export interface LeadProfile {
  userId: string
  email?: string
  name?: string
  totalScore: number
  engagementLevel: string
  firstActivity: Date
  lastActivity: Date
  activities: LeadActivity[]
  tags: string[]
  customFields: Record<string, any>
}

class LeadScoringManager {
  private static instance: LeadScoringManager
  private rules: Map<string, LeadScoringRule> = new Map()
  private profiles: Map<string, LeadProfile> = new Map()
  private ruleOccurrences: Map<string, Map<string, number>> = new Map()
  private lastRuleExecutions: Map<string, Map<string, Date>> = new Map()
  private isInitialized = false

  constructor() {
    this.loadFromStorage()
  }

  static getInstance(): LeadScoringManager {
    if (!LeadScoringManager.instance) {
      LeadScoringManager.instance = new LeadScoringManager()
    }
    return LeadScoringManager.instance
  }

  private loadFromStorage() {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return
      }
      
      const storedRules = localStorage.getItem('lead_scoring_rules')
      if (storedRules) {
        const rulesData = JSON.parse(storedRules)
        rulesData.forEach((rule: any) => {
          this.rules.set(rule.id, rule)
        })
      }

      const storedProfiles = localStorage.getItem('lead_profiles')
      if (storedProfiles) {
        const profilesData = JSON.parse(storedProfiles)
        profilesData.forEach((profile: any) => {
          this.profiles.set(profile.userId, {
            ...profile,
            firstActivity: new Date(profile.firstActivity),
            lastActivity: new Date(profile.lastActivity),
            activities: profile.activities.map((a: any) => ({
              ...a,
              timestamp: new Date(a.timestamp)
            }))
          })
        })
      }

      const storedOccurrences = localStorage.getItem('lead_rule_occurrences')
      if (storedOccurrences) {
        const occurrencesData = JSON.parse(storedOccurrences)
        Object.entries(occurrencesData).forEach(([userId, rules]) => {
          this.ruleOccurrences.set(userId, new Map(Object.entries(rules as Record<string, number>)))
        })
      }

      const storedExecutions = localStorage.getItem('lead_rule_executions')
      if (storedExecutions) {
        const executionsData = JSON.parse(storedExecutions)
        Object.entries(executionsData).forEach(([userId, rules]) => {
          const userExecutions = new Map<string, Date>()
          Object.entries(rules as Record<string, string>).forEach(([ruleId, timestamp]) => {
            userExecutions.set(ruleId, new Date(timestamp))
          })
          this.lastRuleExecutions.set(userId, userExecutions)
        })
      }
    } catch (error) {
      console.warn('Lead Scoring: Could not load from localStorage:', error)
    }
  }

  private saveToStorage() {
    try {
      const rulesArray = Array.from(this.rules.values())
      localStorage.setItem('lead_scoring_rules', JSON.stringify(rulesArray))

      const profilesArray = Array.from(this.profiles.values())
      localStorage.setItem('lead_profiles', JSON.stringify(profilesArray))

      const occurrencesObject: Record<string, Record<string, number>> = {}
      this.ruleOccurrences.forEach((rules, userId) => {
        occurrencesObject[userId] = Object.fromEntries(rules)
      })
      localStorage.setItem('lead_rule_occurrences', JSON.stringify(occurrencesObject))

      const executionsObject: Record<string, Record<string, string>> = {}
      this.lastRuleExecutions.forEach((rules, userId) => {
        const userExecutions: Record<string, string> = {}
        rules.forEach((timestamp, ruleId) => {
          userExecutions[ruleId] = timestamp.toISOString()
        })
        executionsObject[userId] = userExecutions
      })
      localStorage.setItem('lead_rule_executions', JSON.stringify(executionsObject))
    } catch (error) {
      console.warn('Lead Scoring: Could not save to localStorage:', error)
    }
  }

  private generateUserId(): string {
    const stored = localStorage.getItem('lead_user_id')
    if (stored) return stored

    const userId = 'lead_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem('lead_user_id', userId)
    return userId
  }

  initialize() {
    if (this.isInitialized) return

    // Initialize default lead scoring rules
    this.createDefaultRules()
    this.isInitialized = true
    console.log('Lead Scoring: Initialized with', this.rules.size, 'rules')
  }

  private createDefaultRules() {
    const defaultRules: LeadScoringRule[] = [
      {
        id: 'page_visit',
        name: 'Page Visit',
        description: 'User visits a page',
        trigger: 'page_view',
        points: 1,
        maxOccurrences: 50,
        cooldownMinutes: 5,
        isActive: true
      },
      {
        id: 'quickscan_start',
        name: 'QuickScan Started',
        description: 'User starts the QuickScan',
        trigger: 'quick_scan_start',
        points: 10,
        maxOccurrences: 1,
        isActive: true
      },
      {
        id: 'quickscan_progress',
        name: 'QuickScan Progress',
        description: 'User progresses through QuickScan',
        trigger: 'quick_scan_progress',
        points: 2,
        maxOccurrences: 20,
        isActive: true
      },
      {
        id: 'quickscan_complete',
        name: 'QuickScan Completed',
        description: 'User completes the QuickScan',
        trigger: 'quick_scan_complete',
        points: 25,
        maxOccurrences: 1,
        isActive: true
      },
      {
        id: 'email_provided',
        name: 'Email Provided',
        description: 'User provides email address',
        trigger: 'email_capture',
        points: 15,
        maxOccurrences: 1,
        isActive: true
      },
      {
        id: 'pdf_download',
        name: 'PDF Download',
        description: 'User downloads PDF report',
        trigger: 'file_download',
        points: 8,
        maxOccurrences: 3,
        isActive: true
      },
      {
        id: 'form_submission',
        name: 'Form Submission',
        description: 'User submits a form',
        trigger: 'form_submit',
        points: 12,
        maxOccurrences: 5,
        isActive: true
      },
      {
        id: 'contact_page_visit',
        name: 'Contact Page Visit',
        description: 'User visits contact page',
        trigger: 'contact_page_view',
        points: 5,
        maxOccurrences: 3,
        isActive: true
      },
      {
        id: 'services_page_visit',
        name: 'Services Page Visit',
        description: 'User visits services page',
        trigger: 'services_page_view',
        points: 3,
        maxOccurrences: 5,
        isActive: true
      },
      {
        id: 'return_visitor',
        name: 'Return Visitor',
        description: 'User returns to the website',
        trigger: 'return_visit',
        points: 5,
        maxOccurrences: 10,
        cooldownMinutes: 1440, // 24 hours
        isActive: true
      },
      {
        id: 'time_on_site',
        name: 'Extended Time on Site',
        description: 'User spends significant time on site',
        trigger: 'time_on_site',
        points: 7,
        maxOccurrences: 5,
        cooldownMinutes: 30,
        isActive: true
      },
      {
        id: 'high_engagement',
        name: 'High Engagement',
        description: 'User shows high engagement behavior',
        trigger: 'high_engagement',
        points: 15,
        maxOccurrences: 3,
        cooldownMinutes: 60,
        isActive: true
      }
    ]

    defaultRules.forEach(rule => {
      this.rules.set(rule.id, rule)
    })
  }

  createRule(rule: LeadScoringRule) {
    this.rules.set(rule.id, rule)
    this.saveToStorage()
  }

  getRule(ruleId: string): LeadScoringRule | undefined {
    return this.rules.get(ruleId)
  }

  getAllRules(): LeadScoringRule[] {
    return Array.from(this.rules.values())
  }

  getActiveRules(): LeadScoringRule[] {
    return this.getAllRules().filter(rule => rule.isActive)
  }

  processActivity(trigger: string, userId?: string, metadata?: Record<string, any>) {
    const user = userId || this.generateUserId()
    const activeRules = this.getActiveRules().filter(rule => rule.trigger === trigger)
    
    if (activeRules.length === 0) return

    let profile = this.profiles.get(user)
    if (!profile) {
      profile = {
        userId: user,
        totalScore: 0,
        engagementLevel: 'very_low',
        firstActivity: new Date(),
        lastActivity: new Date(),
        activities: [],
        tags: [],
        customFields: {}
      }
      this.profiles.set(user, profile)
    }

    activeRules.forEach(rule => {
      if (this.canExecuteRule(rule, user)) {
        this.executeRule(rule, user, metadata)
      }
    })

    this.saveToStorage()
  }

  private canExecuteRule(rule: LeadScoringRule, userId: string): boolean {
    // Check max occurrences
    if (rule.maxOccurrences) {
      const userOccurrences = this.ruleOccurrences.get(userId) || new Map()
      const count = userOccurrences.get(rule.id) || 0
      if (count >= rule.maxOccurrences) return false
    }

    // Check cooldown
    if (rule.cooldownMinutes) {
      const userExecutions = this.lastRuleExecutions.get(userId) || new Map()
      const lastExecution = userExecutions.get(rule.id)
      if (lastExecution) {
        const cooldownEnd = new Date(lastExecution.getTime() + rule.cooldownMinutes * 60000)
        if (new Date() < cooldownEnd) return false
      }
    }

    return true
  }

  private executeRule(rule: LeadScoringRule, userId: string, metadata?: Record<string, any>) {
    const profile = this.profiles.get(userId)
    if (!profile) return

    // Create activity
    const activity: LeadActivity = {
      id: 'activity_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      userId,
      ruleId: rule.id,
      points: rule.points,
      timestamp: new Date(),
      metadata
    }

    // Update profile
    profile.totalScore += rule.points
    profile.lastActivity = new Date()
    profile.activities.push(activity)

    // Update engagement level
    profile.engagementLevel = this.calculateEngagementLevel(profile.totalScore)

    // Update rule occurrence count
    const userOccurrences = this.ruleOccurrences.get(userId) || new Map()
    userOccurrences.set(rule.id, (userOccurrences.get(rule.id) || 0) + 1)
    this.ruleOccurrences.set(userId, userOccurrences)

    // Update last execution time
    const userExecutions = this.lastRuleExecutions.get(userId) || new Map()
    userExecutions.set(rule.id, new Date())
    this.lastRuleExecutions.set(userId, userExecutions)

    // Update analytics
    analytics.updateLeadScore(rule.points, rule.name)

    console.log(`Lead Scoring: ${rule.name} (+${rule.points} points) - Total: ${profile.totalScore}`)
  }

  private calculateEngagementLevel(score: number): string {
    if (score >= 80) return 'very_high'
    if (score >= 60) return 'high'
    if (score >= 40) return 'medium'
    if (score >= 20) return 'low'
    return 'very_low'
  }

  getLeadProfile(userId?: string): LeadProfile | undefined {
    const user = userId || this.generateUserId()
    return this.profiles.get(user)
  }

  getAllLeadProfiles(): LeadProfile[] {
    return Array.from(this.profiles.values())
  }

  getHighValueLeads(minScore: number = 50): LeadProfile[] {
    return this.getAllLeadProfiles().filter(profile => profile.totalScore >= minScore)
  }

  updateLeadProfile(userId: string, updates: Partial<LeadProfile>) {
    const profile = this.profiles.get(userId)
    if (profile) {
      Object.assign(profile, updates)
      this.profiles.set(userId, profile)
      this.saveToStorage()
    }
  }

  addLeadTag(userId: string, tag: string) {
    const profile = this.profiles.get(userId)
    if (profile && !profile.tags.includes(tag)) {
      profile.tags.push(tag)
      this.saveToStorage()
    }
  }

  removeLeadTag(userId: string, tag: string) {
    const profile = this.profiles.get(userId)
    if (profile) {
      profile.tags = profile.tags.filter(t => t !== tag)
      this.saveToStorage()
    }
  }

  setCustomField(userId: string, fieldName: string, value: any) {
    const profile = this.profiles.get(userId)
    if (profile) {
      profile.customFields[fieldName] = value
      this.saveToStorage()
    }
  }

  // Utility methods
  getCurrentUserScore(userId?: string): number {
    const user = userId || this.generateUserId()
    const profile = this.profiles.get(user)
    return profile?.totalScore || 0
  }

  getCurrentUserEngagement(userId?: string): string {
    const user = userId || this.generateUserId()
    const profile = this.profiles.get(user)
    return profile?.engagementLevel || 'very_low'
  }

  // Analytics and reporting
  getLeadScoringStats() {
    const profiles = this.getAllLeadProfiles()
    const totalLeads = profiles.length
    const averageScore = profiles.reduce((sum, p) => sum + p.totalScore, 0) / totalLeads || 0
    
    const engagementDistribution = profiles.reduce((acc, p) => {
      acc[p.engagementLevel] = (acc[p.engagementLevel] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalLeads,
      averageScore: Math.round(averageScore),
      engagementDistribution,
      highValueLeads: profiles.filter(p => p.totalScore >= 50).length,
      activeRules: this.getActiveRules().length
    }
  }

  // Admin methods
  activateRule(ruleId: string) {
    const rule = this.rules.get(ruleId)
    if (rule) {
      rule.isActive = true
      this.rules.set(ruleId, rule)
      this.saveToStorage()
    }
  }

  deactivateRule(ruleId: string) {
    const rule = this.rules.get(ruleId)
    if (rule) {
      rule.isActive = false
      this.rules.set(ruleId, rule)
      this.saveToStorage()
    }
  }

  resetUserScore(userId: string) {
    const profile = this.profiles.get(userId)
    if (profile) {
      profile.totalScore = 0
      profile.engagementLevel = 'very_low'
      profile.activities = []
      this.profiles.set(userId, profile)
      this.ruleOccurrences.set(userId, new Map())
      this.lastRuleExecutions.set(userId, new Map())
      this.saveToStorage()
    }
  }
}

// Create singleton instance
const leadScoring = LeadScoringManager.getInstance()

export default leadScoring



'use client'

import analytics from './analytics'

export interface ABTestVariant {
  id: string
  name: string
  weight: number
  config: Record<string, any>
}

export interface ABTest {
  id: string
  name: string
  description: string
  variants: ABTestVariant[]
  isActive: boolean
  startDate: Date
  endDate?: Date
  conversionGoal: string
}

export interface ABTestResult {
  testId: string
  variantId: string
  userId: string
  assignedAt: Date
  convertedAt?: Date
  conversionValue?: number
}

class ABTestingManager {
  private static instance: ABTestingManager
  private tests: Map<string, ABTest> = new Map()
  private userAssignments: Map<string, Map<string, string>> = new Map()
  private isInitialized = false

  constructor() {
    this.loadFromStorage()
  }

  static getInstance(): ABTestingManager {
    if (!ABTestingManager.instance) {
      ABTestingManager.instance = new ABTestingManager()
    }
    return ABTestingManager.instance
  }

  private loadFromStorage() {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return
      }
      
      const storedTests = localStorage.getItem('ab_tests')
      if (storedTests) {
        const testsData = JSON.parse(storedTests)
        testsData.forEach((test: any) => {
          this.tests.set(test.id, {
            ...test,
            startDate: new Date(test.startDate),
            endDate: test.endDate ? new Date(test.endDate) : undefined
          })
        })
      }

      const storedAssignments = localStorage.getItem('ab_assignments')
      if (storedAssignments) {
        const assignmentsData = JSON.parse(storedAssignments)
        Object.entries(assignmentsData).forEach(([userId, assignments]) => {
          this.userAssignments.set(userId, new Map(Object.entries(assignments as Record<string, string>)))
        })
      }
    } catch (error) {
      console.warn('AB Testing: Could not load from localStorage:', error)
    }
  }

  private saveToStorage() {
    try {
      const testsArray = Array.from(this.tests.values())
      localStorage.setItem('ab_tests', JSON.stringify(testsArray))

      const assignmentsObject: Record<string, Record<string, string>> = {}
      this.userAssignments.forEach((assignments, userId) => {
        assignmentsObject[userId] = Object.fromEntries(assignments)
      })
      localStorage.setItem('ab_assignments', JSON.stringify(assignmentsObject))
    } catch (error) {
      console.warn('AB Testing: Could not save to localStorage:', error)
    }
  }

  private generateUserId(): string {
    const stored = localStorage.getItem('ab_user_id')
    if (stored) return stored

    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem('ab_user_id', userId)
    return userId
  }

  initialize() {
    if (this.isInitialized) return

    // Initialize default QuickScan A/B test
    this.createTest({
      id: 'quickscan_variants',
      name: 'QuickScan Variants',
      description: 'Test different versions of the QuickScan component',
      variants: [
        {
          id: 'control',
          name: 'Original QuickScan',
          weight: 50,
          config: {
            style: 'default',
            progressIndicator: 'progress_bar',
            questionLayout: 'standard',
            ctaText: 'Volgende',
            showCategoryLabels: true
          }
        },
        {
          id: 'variant_a',
          name: 'Enhanced UX',
          weight: 50,
          config: {
            style: 'enhanced',
            progressIndicator: 'step_indicator',
            questionLayout: 'card_based',
            ctaText: 'Ga door',
            showCategoryLabels: false
          }
        }
      ],
      isActive: true,
      startDate: new Date(),
      conversionGoal: 'quick_scan_complete'
    })

    this.isInitialized = true
    console.log('AB Testing: Initialized with', this.tests.size, 'tests')
  }

  createTest(test: ABTest) {
    this.tests.set(test.id, test)
    this.saveToStorage()
  }

  getTest(testId: string): ABTest | undefined {
    return this.tests.get(testId)
  }

  getAllTests(): ABTest[] {
    return Array.from(this.tests.values())
  }

  getActiveTests(): ABTest[] {
    const now = new Date()
    return this.getAllTests().filter(test => 
      test.isActive && 
      test.startDate <= now && 
      (!test.endDate || test.endDate >= now)
    )
  }

  assignUserToVariant(testId: string, userId?: string): string | null {
    const user = userId || this.generateUserId()
    const test = this.tests.get(testId)
    
    if (!test || !test.isActive) return null

    // Check if user is already assigned to this test
    const userAssignments = this.userAssignments.get(user) || new Map()
    const existingAssignment = userAssignments.get(testId)
    
    if (existingAssignment) {
      return existingAssignment
    }

    // Assign user to variant based on weights
    const totalWeight = test.variants.reduce((sum, variant) => sum + variant.weight, 0)
    const random = Math.random() * totalWeight
    let currentWeight = 0
    
    for (const variant of test.variants) {
      currentWeight += variant.weight
      if (random <= currentWeight) {
        // Assign user to this variant
        userAssignments.set(testId, variant.id)
        this.userAssignments.set(user, userAssignments)
        this.saveToStorage()
        
        // Track assignment
        analytics.trackEvent({
          action: 'ab_test_assignment',
          category: 'ab_testing',
          label: `${testId}_${variant.id}`,
          custom_parameters: {
            test_id: testId,
            variant_id: variant.id,
            user_id: user,
            assignment_timestamp: new Date().toISOString()
          }
        })
        
        return variant.id
      }
    }
    
    return null
  }

  getUserVariant(testId: string, userId?: string): string | null {
    const user = userId || this.generateUserId()
    const userAssignments = this.userAssignments.get(user)
    return userAssignments?.get(testId) || null
  }

  getVariantConfig(testId: string, variantId: string): Record<string, any> | null {
    const test = this.tests.get(testId)
    if (!test) return null
    
    const variant = test.variants.find(v => v.id === variantId)
    return variant?.config || null
  }

  recordConversion(testId: string, userId?: string, value?: number) {
    const user = userId || this.generateUserId()
    const variantId = this.getUserVariant(testId, user)
    
    if (!variantId) return

    const test = this.tests.get(testId)
    if (!test) return

    // Track conversion
    analytics.trackEvent({
      action: 'ab_test_conversion',
      category: 'ab_testing',
      label: `${testId}_${variantId}`,
      value: value,
      custom_parameters: {
        test_id: testId,
        variant_id: variantId,
        user_id: user,
        conversion_goal: test.conversionGoal,
        conversion_value: value,
        conversion_timestamp: new Date().toISOString()
      }
    })

    console.log(`AB Test Conversion: ${testId} - ${variantId} - ${value || 'no value'}`)
  }

  // QuickScan specific methods
  getQuickScanVariant(userId?: string): string {
    const user = userId || this.generateUserId()
    let variantId = this.getUserVariant('quickscan_variants', user)
    
    if (!variantId) {
      variantId = this.assignUserToVariant('quickscan_variants', user)
    }
    
    return variantId || 'control'
  }

  getQuickScanConfig(userId?: string): Record<string, any> {
    const variantId = this.getQuickScanVariant(userId)
    return this.getVariantConfig('quickscan_variants', variantId) || {}
  }

  recordQuickScanConversion(userId?: string, results?: any) {
    const user = userId || this.generateUserId()
    const value = results?.totalPercentage || 0
    this.recordConversion('quickscan_variants', user, value)
  }

  // Analytics and reporting
  getTestResults(testId: string): any {
    // This would typically fetch from a backend service
    // For now, return basic structure
    return {
      testId,
      totalParticipants: 0,
      conversions: 0,
      conversionRate: 0,
      variants: []
    }
  }

  // Admin methods
  activateTest(testId: string) {
    const test = this.tests.get(testId)
    if (test) {
      test.isActive = true
      this.tests.set(testId, test)
      this.saveToStorage()
    }
  }

  deactivateTest(testId: string) {
    const test = this.tests.get(testId)
    if (test) {
      test.isActive = false
      this.tests.set(testId, test)
      this.saveToStorage()
    }
  }

  endTest(testId: string) {
    const test = this.tests.get(testId)
    if (test) {
      test.isActive = false
      test.endDate = new Date()
      this.tests.set(testId, test)
      this.saveToStorage()
    }
  }
}

// Create singleton instance
const abTesting = ABTestingManager.getInstance()

export default abTesting

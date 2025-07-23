

// Type definitions for the application

export interface QuickScanAnswer {
  questionId: number
  value: string | number
  score: number
}

export interface CategoryScore {
  score: number
  maxScore: number
  percentage: number
}

export interface QuickScanResults {
  totalScore: number
  maxTotalScore: number
  totalPercentage: number
  maturityLevel: string
  categoryScores: { [key: string]: CategoryScore }
}

// Blog/CMS Types
export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featuredImage?: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  authorName: string
  authorEmail: string
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
  metaTitle?: string
  metaDescription?: string
  keywords?: string
  categories: BlogCategory[]
  tags: BlogTag[]
  viewCount: number
  shareCount: number
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description?: string
  color: string
  createdAt: Date
  posts?: BlogPost[]
}

export interface BlogTag {
  id: string
  name: string
  slug: string
  createdAt: Date
  posts?: BlogPost[]
}

export interface CreateBlogPostData {
  title: string
  content: string
  excerpt: string
  featuredImage?: string
  categories: string[]
  tags: string[]
  status?: 'DRAFT' | 'PUBLISHED'
  metaTitle?: string
  metaDescription?: string
  keywords?: string
}

export interface BlogSearchParams {
  query?: string
  category?: string
  tag?: string
  status?: string
  page?: number
  limit?: number
}

// Newsletter Types
export interface NewsletterSubscriber {
  id: string
  email: string
  name: string | null
  company: string | null
  isActive: boolean
  preferences: string[]
  source: string | null
  leadScore: number
  lastEngagement: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface NewsletterSignupData {
  email: string
  name?: string
  company?: string
  preferences: string[]
  source?: string
}

export interface NewsletterCampaign {
  id: string
  subject: string
  content: string
  template: string
  scheduledFor?: Date
  sentAt?: Date
  recipientCount: number
  openRate: number
  clickRate: number
}

// Social Media Types
export interface SocialMediaPost {
  id: string
  platform: 'LINKEDIN' | 'TWITTER' | 'FACEBOOK'
  postId: string
  content: string
  url: string
  imageUrl?: string
  publishedAt: Date
  engagements: number
  createdAt: Date
}

export interface SocialShareData {
  url: string
  title: string
  description: string
  image?: string
}

// Lead Generation Types
export interface LeadSource {
  blog: number
  newsletter: number
  social: number
  quickScan: number
  contact: number
}

export interface MarketingMetrics {
  blogViews: number
  newsletterSubscribers: number
  socialShares: number
  leadConversions: number
  engagementRate: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Chatbot Types
export interface ChatConversation {
  id: string
  sessionId: string
  userEmail?: string
  userName?: string
  userCompany?: string
  userPhone?: string
  leadScore: number
  status: 'ACTIVE' | 'QUALIFIED' | 'CONVERTED' | 'ARCHIVED'
  createdAt: Date
  updatedAt: Date
  messages: ChatMessage[]
}

export interface ChatMessage {
  id: string
  conversationId: string
  role: 'USER' | 'ASSISTANT' | 'SYSTEM'
  content: string
  metadata?: any
  createdAt: Date
}

export interface ChatbotConfig {
  id: string
  name: string
  welcomeMessage: string
  fallbackMessage: string
  leadQualificationEnabled: boolean
  autoResponseEnabled: boolean
  businessHours: any
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// CRM Types
export interface CrmContact {
  id: string
  hubspotId?: string | null
  email: string
  firstName: string
  lastName: string
  company?: string | null
  phone?: string | null
  jobTitle?: string | null
  leadScore: number
  lifecycleStage?: string | null
  leadSource?: string | null
  lastActivity?: Date | null
  isActive: boolean
  syncedAt?: Date | null
  createdAt: Date
  updatedAt: Date
  activities: CrmActivity[]
}

export interface CrmActivity {
  id: string
  contactId: string
  type: string
  subject: string
  description?: string | null
  outcome?: string | null
  scheduledAt?: Date | null
  completedAt?: Date | null
  createdAt: Date
}

// Analytics Types
export interface AnalyticsEvent {
  id: string
  sessionId: string
  eventType: string
  eventData: any
  userAgent?: string
  ipAddress?: string
  referrer?: string
  page?: string
  userId?: string
  timestamp: Date
}

export interface ConversionMetrics {
  id: string
  date: Date
  pageViews: number
  uniqueVisitors: number
  contactForms: number
  quickScans: number
  newsletterSignups: number
  consultationBookings: number
  conversionRate: number
}

// FAQ Types
export interface FaqCategory {
  id: string
  name: string
  slug: string
  description?: string
  order: number
  isActive: boolean
  createdAt: Date
  faqs: Faq[]
}

export interface Faq {
  id: string
  categoryId: string
  question: string
  answer: string
  order: number
  isActive: boolean
  viewCount: number
  createdAt: Date
  updatedAt: Date
  category: FaqCategory
}

// Team Types
export interface TeamMember {
  id: string
  name: string
  position: string
  bio: string
  imageUrl?: string
  email?: string
  phone?: string
  linkedinUrl?: string
  expertise: string[]
  isActive: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

// Customer Portal Types
export interface Customer {
  id: string
  email: string
  name: string
  company: string
  phone?: string
  hashedPassword: string
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
  projects: CustomerProject[]
  documents: CustomerDocument[]
}

export interface CustomerProject {
  id: string
  customerId: string
  name: string
  description?: string
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED'
  progress: number
  startDate: Date
  endDate?: Date
  createdAt: Date
  updatedAt: Date
  customer: Customer
  documents: CustomerDocument[]
}

export interface CustomerDocument {
  id: string
  customerId: string
  projectId?: string
  title: string
  description?: string
  fileName: string
  fileUrl: string
  fileSize?: number
  mimeType?: string
  isConfidential: boolean
  uploadedAt: Date
  customer: Customer
  project?: CustomerProject
}

// Dashboard Types
export interface DashboardStats {
  totalLeads: number
  qualifiedLeads: number
  conversionRate: number
  quickScansCompleted: number
  chatConversations: number
  activeCustomers: number
  monthlyGrowth: number
  topLeadSources: Array<{
    source: string
    count: number
    percentage: number
  }>
}

// HubSpot Integration Types
export interface HubSpotContact {
  id: string
  properties: {
    email: string
    firstname: string
    lastname: string
    company: string
    phone: string
    jobtitle: string
    lifecyclestage: string
    hs_lead_status: string
    leadscore: number
  }
  createdAt: string
  updatedAt: string
}

export interface HubSpotDeal {
  id: string
  properties: {
    dealname: string
    amount: number
    dealstage: string
    closedate: string
    pipeline: string
    hubspot_owner_id: string
  }
}

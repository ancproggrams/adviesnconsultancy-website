
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting comprehensive database seed...')
  
  try {
    // Clear existing data in correct order (foreign keys first)
    await prisma.customerDocument.deleteMany({})
    await prisma.customerProject.deleteMany({})
    await prisma.customer.deleteMany({})
    await prisma.teamMember.deleteMany({})
    await prisma.faq.deleteMany({})
    await prisma.faqCategory.deleteMany({})
    await prisma.analyticsEvent.deleteMany({})
    await prisma.conversionMetrics.deleteMany({})
    await prisma.crmActivity.deleteMany({})
    await prisma.crmContact.deleteMany({})
    await prisma.chatMessage.deleteMany({})
    await prisma.chatConversation.deleteMany({})
    await prisma.chatbotConfig.deleteMany({})
    await prisma.socialMediaPost.deleteMany({})
    await prisma.newsletterSubscriber.deleteMany({})
    await prisma.quickScanResult.deleteMany({})
    await prisma.caseStudy.deleteMany({})
    await prisma.downloadResource.deleteMany({})
    await prisma.blogTag.deleteMany({})
    await prisma.blogCategory.deleteMany({})
    await prisma.blogPost.deleteMany({})
    await prisma.contact.deleteMany({})
    
    console.log('✅ Cleared existing data')

    // Create chatbot config
    await prisma.chatbotConfig.create({
      data: {
        name: 'default',
        welcomeMessage: 'Hallo! Ik ben de virtuele assistent van Advies N Consultancy. Ik help u graag met vragen over business continuïteit, compliance, en onze diensten. Waarmee kan ik u helpen?',
        fallbackMessage: 'Sorry, ik begrijp uw vraag niet helemaal. Kunt u het anders formuleren of wilt u contact opnemen met een van onze consultants?',
        leadQualificationEnabled: true,
        autoResponseEnabled: true,
        businessHours: {
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '17:00' },
          saturday: { start: '10:00', end: '16:00' },
          sunday: { start: '10:00', end: '16:00' }
        },
        isActive: true
      }
    })

    // Create sample CRM contacts
    const crmContacts = await Promise.all([
      prisma.crmContact.create({
        data: {
          email: 'jan.bakker@techcorp.nl',
          firstName: 'Jan',
          lastName: 'Bakker',
          company: 'TechCorp B.V.',
          phone: '+31 6 12345678',
          jobTitle: 'IT Manager',
          leadScore: 75,
          leadSource: 'website',
          lifecycleStage: 'marketingqualifiedlead',
          lastActivity: new Date('2024-01-15')
        }
      }),
      prisma.crmContact.create({
        data: {
          email: 'maria.devries@logistics.nl',
          firstName: 'Maria',
          lastName: 'de Vries',
          company: 'LogisticsPro',
          phone: '+31 6 87654321',
          jobTitle: 'Operations Director',
          leadScore: 85,
          leadSource: 'quickscan',
          lifecycleStage: 'salesqualifiedlead',
          lastActivity: new Date('2024-01-20')
        }
      }),
      prisma.crmContact.create({
        data: {
          email: 'p.jansen@finance.nl',
          firstName: 'Peter',
          lastName: 'Jansen',
          company: 'FinanceFirst',
          phone: '+31 6 11223344',
          jobTitle: 'Compliance Officer',
          leadScore: 60,
          leadSource: 'chatbot',
          lifecycleStage: 'lead',
          lastActivity: new Date('2024-01-18')
        }
      })
    ])

    // Create sample CRM activities
    await Promise.all([
      prisma.crmActivity.create({
        data: {
          contactId: crmContacts[0].id,
          type: 'quickscan_completed',
          subject: 'BCM QuickScan voltooid',
          description: 'Jan heeft de BCM QuickScan voltooid met een score van 2.5/5',
          completedAt: new Date('2024-01-15')
        }
      }),
      prisma.crmActivity.create({
        data: {
          contactId: crmContacts[1].id,
          type: 'consultation_requested',
          subject: 'Consultatie aangevraagd',
          description: 'Maria heeft een consultatie aangevraagd voor ISO 22301 implementatie',
          completedAt: new Date('2024-01-20')
        }
      })
    ])

    // Create sample chatbot conversations
    const chatConversations = await Promise.all([
      prisma.chatConversation.create({
        data: {
          sessionId: 'session_123456',
          userEmail: 'jan.bakker@techcorp.nl',
          userName: 'Jan Bakker',
          userCompany: 'TechCorp B.V.',
          userPhone: '+31 6 12345678',
          leadScore: 75,
          status: 'QUALIFIED'
        }
      }),
      prisma.chatConversation.create({
        data: {
          sessionId: 'session_789012',
          userEmail: 'test@example.com',
          userName: 'Test User',
          leadScore: 25,
          status: 'ACTIVE'
        }
      })
    ])

    // Create sample chat messages
    await Promise.all([
      prisma.chatMessage.create({
        data: {
          conversationId: chatConversations[0].id,
          role: 'USER',
          content: 'Hallo, ik heb vragen over ISO 22301 compliance'
        }
      }),
      prisma.chatMessage.create({
        data: {
          conversationId: chatConversations[0].id,
          role: 'ASSISTANT',
          content: 'Hallo! Ik help u graag met vragen over ISO 22301. Kunt u me vertellen wat u specifiek wilt weten?'
        }
      }),
      prisma.chatMessage.create({
        data: {
          conversationId: chatConversations[0].id,
          role: 'USER',
          content: 'Hoe lang duurt een ISO 22301 implementatie?'
        }
      }),
      prisma.chatMessage.create({
        data: {
          conversationId: chatConversations[0].id,
          role: 'ASSISTANT',
          content: 'Een ISO 22301 implementatie duurt gemiddeld 6-12 maanden, afhankelijk van de grootte en complexiteit van uw organisatie. Zou u geïnteresseerd zijn in een gratis QuickScan om uw huidige situatie te beoordelen?'
        }
      })
    ])

    // Create FAQ categories
    const faqCategories = await Promise.all([
      prisma.faqCategory.create({
        data: {
          name: 'Compliance & Regelgeving',
          slug: 'compliance-regelgeving',
          description: 'Vragen over compliance en regelgeving',
          order: 1
        }
      }),
      prisma.faqCategory.create({
        data: {
          name: 'BCM QuickScan',
          slug: 'bcm-quickscan',
          description: 'Vragen over onze BCM assessment tool',
          order: 2
        }
      }),
      prisma.faqCategory.create({
        data: {
          name: 'Diensten & Consultancy',
          slug: 'diensten-consultancy',
          description: 'Vragen over onze diensten',
          order: 3
        }
      })
    ])

    // Create sample FAQs
    await Promise.all([
      prisma.faq.create({
        data: {
          categoryId: faqCategories[0].id,
          question: 'Wat is ISO 22301 en waarom is het belangrijk?',
          answer: 'ISO 22301 is de internationale standaard voor Business Continuity Management Systems (BCMS). Het helpt organisaties om zich voor te bereiden op, te reageren op en te herstellen van verstorende incidenten.',
          order: 1,
          viewCount: 156
        }
      }),
      prisma.faq.create({
        data: {
          categoryId: faqCategories[0].id,
          question: 'Hoe lang duurt een ISO 22301 certificering?',
          answer: 'Een ISO 22301 certificering duurt gemiddeld 6-12 maanden, afhankelijk van de grootte en complexiteit van uw organisatie.',
          order: 2,
          viewCount: 98
        }
      }),
      prisma.faq.create({
        data: {
          categoryId: faqCategories[1].id,
          question: 'Wat is de BCM QuickScan en hoe werkt het?',
          answer: 'De BCM QuickScan is een gratis online assessment tool die uw huidige BCM volwassenheid evalueert aan de hand van ISO 22301 criteria.',
          order: 1,
          viewCount: 245
        }
      }),
      prisma.faq.create({
        data: {
          categoryId: faqCategories[1].id,
          question: 'Krijg ik direct mijn resultaten?',
          answer: 'Ja, direct na het voltooien van de scan ontvangt u een gedetailleerd rapport met uw scores en aanbevelingen.',
          order: 2,
          viewCount: 189
        }
      })
    ])

    // Create team members
    await Promise.all([
      prisma.teamMember.create({
        data: {
          name: 'Marc René',
          position: 'Senior BCM Consultant & Eigenaar',
          bio: 'Marc heeft meer dan 15 jaar ervaring in business continuity management en compliance. Hij is gecertificeerd ISO 22301 Lead Auditor.',
          imageUrl: '/images/team/marc-rene.jpg',
          email: 'marc@adviesnconsultancy.nl',
          phone: '+31 6 22675520',
          linkedinUrl: 'https://linkedin.com/in/marcrene',
          expertise: ['ISO 22301', 'BCM Implementation', 'Crisis Management', 'Risk Assessment'],
          order: 1
        }
      }),
      prisma.teamMember.create({
        data: {
          name: 'Sarah van der Berg',
          position: 'BCM Consultant',
          bio: 'Sarah is gespecialiseerd in BCM voor de financiële sector en heeft uitgebreide ervaring met regulatory compliance.',
          imageUrl: '/images/team/sarah-van-der-berg.jpg',
          email: 'sarah@adviesnconsultancy.nl',
          phone: '+31 6 12345678',
          linkedinUrl: 'https://linkedin.com/in/sarahvdberg',
          expertise: ['Financial Services BCM', 'Regulatory Compliance', 'Risk Management'],
          order: 2
        }
      })
    ])

    // Create sample customer
    const hashedPassword = await bcrypt.hash('password123', 12)
    const customer = await prisma.customer.create({
      data: {
        email: 'jan.smit@techcorp.nl',
        name: 'Jan Smit',
        company: 'TechCorp B.V.',
        phone: '+31 6 12345678',
        hashedPassword,
        lastLogin: new Date('2024-01-20')
      }
    })

    // Create sample customer projects
    const customerProjects = await Promise.all([
      prisma.customerProject.create({
        data: {
          customerId: customer.id,
          name: 'ISO 22301 Implementatie',
          description: 'Volledige implementatie van Business Continuity Management System',
          status: 'ACTIVE',
          progress: 65,
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-06-15')
        }
      }),
      prisma.customerProject.create({
        data: {
          customerId: customer.id,
          name: 'Crisis Team Training',
          description: 'Training programma voor crisis response team',
          status: 'COMPLETED',
          progress: 100,
          startDate: new Date('2023-11-01'),
          endDate: new Date('2023-12-01')
        }
      })
    ])

    // Create sample customer documents
    await Promise.all([
      prisma.customerDocument.create({
        data: {
          customerId: customer.id,
          projectId: customerProjects[0].id,
          title: 'BCM Beleidsdocument v2.1',
          description: 'Goedgekeurde versie van het BCM beleid',
          fileName: 'bcm-beleid-v2.1.pdf',
          fileUrl: '/customer-documents/bcm-beleid-v2.1.pdf',
          fileSize: 2456789,
          mimeType: 'application/pdf',
          isConfidential: false
        }
      }),
      prisma.customerDocument.create({
        data: {
          customerId: customer.id,
          projectId: customerProjects[0].id,
          title: 'Risk Assessment Report',
          description: 'Uitgebreide risicobeoordeling voor kritieke processen',
          fileName: 'risk-assessment-report.pdf',
          fileUrl: '/customer-documents/risk-assessment-report.pdf',
          fileSize: 1234567,
          mimeType: 'application/pdf',
          isConfidential: true
        }
      })
    ])

    // Create blog categories
    const categories = await Promise.all([
      prisma.blogCategory.create({
        data: {
          name: 'Business Continuity',
          slug: 'business-continuity',
          description: 'Inzichten over business continuity management',
          color: '#60B5FF'
        }
      }),
      prisma.blogCategory.create({
        data: {
          name: 'Compliance',
          slug: 'compliance',
          description: 'Compliance en regelgeving updates',
          color: '#FF9149'
        }
      }),
      prisma.blogCategory.create({
        data: {
          name: 'Technology',
          slug: 'technology',
          description: 'Technologie en innovatie',
          color: '#80D8C3'
        }
      })
    ])
    
    // Create blog tags
    const tags = await Promise.all([
      prisma.blogTag.create({
        data: {
          name: 'ISO 22301',
          slug: 'iso-22301'
        }
      }),
      prisma.blogTag.create({
        data: {
          name: 'Risk Management',
          slug: 'risk-management'
        }
      }),
      prisma.blogTag.create({
        data: {
          name: 'Crisis Management',
          slug: 'crisis-management'
        }
      })
    ])

    // Create sample QuickScan results
    await Promise.all([
      prisma.quickScanResult.create({
        data: {
          name: 'Jan Bakker',
          email: 'jan.bakker@techcorp.nl',
          company: 'TechCorp B.V.',
          phone: '+31 6 12345678',
          position: 'IT Manager',
          hasBcmOfficer: true,
          hasCrisisTeam: false,
          responses: [
            { questionId: 1, score: 3, area: 'context' },
            { questionId: 2, score: 2, area: 'context' },
            { questionId: 3, score: 4, area: 'leadership' }
          ],
          contextScore: 3,
          leadershipScore: 3,
          planningScore: 2,
          supportScore: 3,
          operationScore: 2,
          performanceScore: 2,
          improvementScore: 2,
          overallScore: 2,
          maturityLevel: 'Developing',
          reportGenerated: true,
          wantsConsultation: true,
          consultationScheduled: false
        }
      })
    ])

    // Create sample contacts
    await Promise.all([
      prisma.contact.create({
        data: {
          name: 'Jan Bakker',
          email: 'jan.bakker@techcorp.nl',
          company: 'TechCorp B.V.',
          phone: '+31 6 12345678',
          message: 'Wij zijn geïnteresseerd in ISO 22301 certificering.',
          formType: 'general',
          interest: 'ISO 22301 Certification'
        }
      })
    ])

    // Create sample analytics events
    await Promise.all([
      prisma.analyticsEvent.create({
        data: {
          sessionId: 'session_analytics_1',
          eventType: 'pageview',
          eventData: { page: '/', title: 'Home' },
          page: '/',
          timestamp: new Date('2024-01-20T10:00:00Z')
        }
      }),
      prisma.analyticsEvent.create({
        data: {
          sessionId: 'session_analytics_2',
          eventType: 'quickscan_start',
          eventData: { page: '/compliance-automation' },
          page: '/compliance-automation',
          timestamp: new Date('2024-01-20T11:00:00Z')
        }
      })
    ])

    // Create conversion metrics
    await Promise.all([
      prisma.conversionMetrics.create({
        data: {
          date: new Date('2024-01-19'),
          pageViews: 150,
          uniqueVisitors: 120,
          contactForms: 5,
          quickScans: 8,
          newsletterSignups: 3,
          consultationBookings: 2,
          conversionRate: 15.0
        }
      }),
      prisma.conversionMetrics.create({
        data: {
          date: new Date('2024-01-20'),
          pageViews: 180,
          uniqueVisitors: 140,
          contactForms: 7,
          quickScans: 12,
          newsletterSignups: 5,
          consultationBookings: 3,
          conversionRate: 18.5
        }
      })
    ])

    console.log('✅ Database seeded successfully!')
    console.log('Created:')
    console.log('- 1 chatbot config')
    console.log('- 3 CRM contacts with activities')
    console.log('- 2 chat conversations with messages')
    console.log('- 3 FAQ categories with 4 FAQs')
    console.log('- 2 team members')
    console.log('- 1 customer with projects and documents')
    console.log('- Sample analytics events and conversion metrics')
    console.log('- 3 blog categories and tags')
    console.log('- 1 QuickScan result')
    console.log('- 1 contact form submission')

  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

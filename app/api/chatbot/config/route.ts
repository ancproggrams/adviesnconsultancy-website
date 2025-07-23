
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get or create default chatbot config
    let config = await prisma.chatbotConfig.findFirst({
      where: { name: 'default' }
    })

    if (!config) {
      config = await prisma.chatbotConfig.create({
        data: {
          name: 'default',
          welcomeMessage: 'Hallo! Ik ben de virtuele assistent van Advies N Consultancy. Waarmee kan ik u helpen?',
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
    }

    return NextResponse.json(config)

  } catch (error) {
    console.error('Chatbot config API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const config = await prisma.chatbotConfig.upsert({
      where: { name: 'default' },
      update: data,
      create: {
        name: 'default',
        ...data
      }
    })

    return NextResponse.json(config)

  } catch (error) {
    console.error('Chatbot config update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

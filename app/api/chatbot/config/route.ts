
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

const CONFIG_QUERY_TIMEOUT_MS = 1200

const defaultConfig = {
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

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined

  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      timeout = setTimeout(() => reject(new Error('Chatbot config query timed out')), timeoutMs)
    }),
  ]).finally(() => {
    if (timeout) clearTimeout(timeout)
  })
}

export async function GET() {
  try {
    const config = await withTimeout(
      prisma.chatbotConfig.findFirst({
        where: { name: 'default' }
      }),
      CONFIG_QUERY_TIMEOUT_MS
    )

    return NextResponse.json(config ?? defaultConfig)

  } catch (error) {
    console.warn('Using default chatbot config because the database is unavailable.')
    return NextResponse.json(defaultConfig)
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

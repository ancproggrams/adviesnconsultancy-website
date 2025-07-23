
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, userInfo } = await request.json()

    if (!message || !sessionId) {
      return NextResponse.json({ error: 'Message and sessionId are required' }, { status: 400 })
    }

    // Find or create conversation
    let conversation = await prisma.chatConversation.findUnique({
      where: { sessionId },
      include: { messages: true }
    })

    if (!conversation) {
      conversation = await prisma.chatConversation.create({
        data: {
          sessionId,
          userEmail: userInfo?.email,
          userName: userInfo?.name,
          userCompany: userInfo?.company,
          userPhone: userInfo?.phone,
        },
        include: { messages: true }
      })
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content: message,
      }
    })

    // Prepare conversation context for LLM
    const conversationHistory = conversation.messages.map((msg: any) => ({
      role: msg.role.toLowerCase(),
      content: msg.content
    }))

    conversationHistory.push({
      role: 'user',
      content: message
    })

    // Prepare system prompt for lead qualification
    const systemPrompt = `Je bent een virtuele assistent voor Advies N Consultancy BV, een IT-consultancy bedrijf gespecialiseerd in business continuïteit, compliance automatisering, en digitale transformatie.

BEDRIJFSINFORMATIE:
- Diensten: Business Continuïteit Management (BCM), ISO 22301 compliance, AI-outsourcing, digitale transformatie
- Specialisaties: Compliance automatisering, cybersecurity, IT-advisory
- Locatie: Voorburg, Nederland
- Contact: +31 6 22675520, info@adviesnconsultancy.nl

GEDRAGSREGELS:
1. Wees professioneel, behulpzaam en vriendelijk
2. Gebruik Nederlandse taal
3. Geef accurate informatie over onze diensten
4. Verwijs bij complexe vragen naar een persoonlijk gesprek
5. Probeer leads te kwalificeren door over bedrijfsgrootte, compliance behoeften en uitdagingen te vragen

LEAD QUALIFICATION:
- Vraag naar bedrijfsgrootte, sector, huidige compliance situatie
- Identificeer pijnpunten rond business continuïteit
- Stel de BCM QuickScan voor als ze interesse tonen
- Als ze geïnteresseerd zijn en nog geen contactgegevens hebben gegeven, voeg dan "TRIGGER_LEAD_FORM" toe aan je antwoord

DIENSTEN DETAILS:
- BCM Quickscan: Gratis assessment van business continuïteit volwassenheid
- ISO 22301 certificering ondersteuning
- Compliance automatisering met AI
- Crisismanagement en herstelplannen
- IT-infrastructuur consultancy

Beantwoord vragen direct en praktisch. Moedig een gesprek aan.`

    // Call LLM API
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory
        ],
        stream: true,
        max_tokens: 500,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error('LLM API request failed')
    }

    const encoder = new TextEncoder()
    let fullResponse = ''

    const readable = new ReadableStream({
      async start(controller) {
        try {
          const reader = response.body?.getReader()
          if (!reader) throw new Error('No reader available')

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = new TextDecoder().decode(value)
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  // Save assistant response to database
                  if (conversation) {
                    await prisma.chatMessage.create({
                      data: {
                        conversationId: conversation.id,
                        role: 'ASSISTANT',
                        content: fullResponse,
                      }
                    })
                  }

                  controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                  controller.close()
                  return
                }

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content || ''
                  if (content) {
                    fullResponse += content
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error('Streaming error:', error)
          controller.error(error)
        }
      }
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      }
    })

  } catch (error) {
    console.error('Chatbot API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

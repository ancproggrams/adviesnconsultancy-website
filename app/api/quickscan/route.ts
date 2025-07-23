
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      name,
      email,
      company,
      phone,
      position,
      hasBcmOfficer,
      hasCrisisTeam,
      responses
    } = body

    // Calculate scores per control area
    const areaScores: Record<string, number[]> = {
      context: [],
      leadership: [],
      planning: [],
      support: [],
      operation: [],
      performance: [],
      improvement: []
    }

    // Group responses by control area
    responses.forEach((response: any) => {
      if (response.controlArea && response.score !== undefined) {
        areaScores[response.controlArea]?.push(response.score)
      }
    })

    // Calculate average scores for each area
    const contextScore = areaScores.context.length > 0 
      ? Math.round(areaScores.context.reduce((a, b) => a + b, 0) / areaScores.context.length)
      : 1

    const leadershipScore = areaScores.leadership.length > 0 
      ? Math.round(areaScores.leadership.reduce((a, b) => a + b, 0) / areaScores.leadership.length)
      : 1

    const planningScore = areaScores.planning.length > 0 
      ? Math.round(areaScores.planning.reduce((a, b) => a + b, 0) / areaScores.planning.length)
      : 1

    const supportScore = areaScores.support.length > 0 
      ? Math.round(areaScores.support.reduce((a, b) => a + b, 0) / areaScores.support.length)
      : 1

    const operationScore = areaScores.operation.length > 0 
      ? Math.round(areaScores.operation.reduce((a, b) => a + b, 0) / areaScores.operation.length)
      : 1

    const performanceScore = areaScores.performance.length > 0 
      ? Math.round(areaScores.performance.reduce((a, b) => a + b, 0) / areaScores.performance.length)
      : 1

    const improvementScore = areaScores.improvement.length > 0 
      ? Math.round(areaScores.improvement.reduce((a, b) => a + b, 0) / areaScores.improvement.length)
      : 1

    // Calculate overall score
    const allScores = [
      contextScore,
      leadershipScore,
      planningScore,
      supportScore,
      operationScore,
      performanceScore,
      improvementScore
    ]
    
    const overallScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)

    // Determine maturity level
    let maturityLevel = 'Beginner'
    if (overallScore >= 5) maturityLevel = 'Geoptimaliseerd'
    else if (overallScore >= 4) maturityLevel = 'Beheerd'
    else if (overallScore >= 3) maturityLevel = 'Gedefinieerd'
    else if (overallScore >= 2) maturityLevel = 'Ontwikkelend'

    // Save to database
    const result = await prisma.quickScanResult.create({
      data: {
        name,
        email,
        company,
        phone: phone || null,
        position: position || null,
        hasBcmOfficer,
        hasCrisisTeam,
        responses,
        contextScore,
        leadershipScore,
        planningScore,
        supportScore,
        operationScore,
        performanceScore,
        improvementScore,
        overallScore,
        maturityLevel,
        wantsConsultation: false
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        overallScore,
        maturityLevel,
        scores: {
          context: contextScore,
          leadership: leadershipScore,
          planning: planningScore,
          support: supportScore,
          operation: operationScore,
          performance: performanceScore,
          improvement: improvementScore
        }
      }
    })

  } catch (error) {
    console.error('QuickScan API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Er is een fout opgetreden bij het opslaan van de resultaten.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Geen scan ID opgegeven.' },
        { status: 400 }
      )
    }

    const result = await prisma.quickScanResult.findUnique({
      where: { id }
    })

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Scan resultaat niet gevonden.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('QuickScan GET API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Er is een fout opgetreden bij het ophalen van de resultaten.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

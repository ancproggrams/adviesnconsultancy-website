
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const {
      action,
      sessionToken,
      userId,
      activityType,
      ipAddress,
      userAgent,
      isAdmin,
      metadata
    } = await request.json()

    switch (action) {
      case 'track_activity':
        // Track session activity
        await prisma.activeSession.upsert({
          where: { sessionToken },
          update: {
            lastActivity: new Date()
          },
          create: {
            sessionToken,
            adminId: userId,
            ipAddress: ipAddress || 'unknown',
            userAgent: userAgent || 'unknown',
            isActive: true,
            lastActivity: new Date()
          }
        })

        // Also log the activity
        await prisma.sessionActivity.create({
          data: {
            sessionToken,
            adminId: userId,
            activity: activityType || 'unknown',
            ipAddress: ipAddress || 'unknown',
            userAgent: userAgent || 'unknown',
            isSuccessful: true,
            metadata: metadata || null
          }
        })
        break

      case 'update_activity':
        // Update session activity timestamp
        await prisma.activeSession.updateMany({
          where: { sessionToken, isActive: true },
          data: { lastActivity: new Date() }
        })
        break

      case 'detect_suspicious':
        // Simplified suspicious activity detection
        const recentSessions = await prisma.activeSession.findMany({
          where: {
            adminId: userId,
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          }
        })

        const uniqueIPs = new Set(recentSessions.map((s: any) => s.ipAddress)).size
        const suspicious = uniqueIPs > 3 // More than 3 different IPs in 24h
        const reasons = suspicious ? ['multiple_ip_addresses'] : []

        return NextResponse.json({ suspicious, reasons })

      case 'invalidate_sessions':
        // Invalidate all sessions for user
        await prisma.activeSession.updateMany({
          where: { adminId: userId, isActive: true },
          data: { isActive: false }
        })
        break
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Session management error:', error)
    return NextResponse.json({ error: 'Failed to manage session' }, { status: 500 })
  }
}

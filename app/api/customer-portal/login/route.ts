
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Find customer by email
    const customer = await prisma.customer.findUnique({
      where: { email },
      include: {
        projects: {
          include: {
            documents: true
          }
        },
        documents: true
      }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, customer.hashedPassword)

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Update last login
    await prisma.customer.update({
      where: { id: customer.id },
      data: { lastLogin: new Date() }
    })

    // Return customer data (excluding password)
    const { hashedPassword, ...customerData } = customer

    return NextResponse.json({
      success: true,
      customer: customerData
    })

  } catch (error) {
    console.error('Customer login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

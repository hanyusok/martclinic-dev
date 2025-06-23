import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get fresh data from database
    const dbUser = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        licenseNumber: true,
        institutionName: true,
        institutionAddress: true,
        institutionPhone: true,
        updatedAt: true,
      },
    })

    if (!dbUser) {
      return new NextResponse('User not found in database', { status: 404 })
    }

    // Compare session data with database data
    const comparison = {
      session: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        licenseNumber: session.user.licenseNumber,
        institutionName: session.user.institutionName,
        institutionAddress: session.user.institutionAddress,
        institutionPhone: session.user.institutionPhone,
      },
      database: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        licenseNumber: dbUser.licenseNumber,
        institutionName: dbUser.institutionName,
        institutionAddress: dbUser.institutionAddress,
        institutionPhone: dbUser.institutionPhone,
        updatedAt: dbUser.updatedAt,
      },
      differences: {
        name: session.user.name !== dbUser.name,
        email: session.user.email !== dbUser.email,
        licenseNumber: session.user.licenseNumber !== dbUser.licenseNumber,
        institutionName: session.user.institutionName !== dbUser.institutionName,
        institutionAddress: session.user.institutionAddress !== dbUser.institutionAddress,
        institutionPhone: session.user.institutionPhone !== dbUser.institutionPhone,
      },
      isOutOfSync: false,
    }

    // Check if any field is out of sync
    comparison.isOutOfSync = Object.values(comparison.differences).some(diff => diff)

    return NextResponse.json(comparison)
  } catch (error) {
    console.error('Error comparing session vs database:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 
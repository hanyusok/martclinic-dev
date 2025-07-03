export const dynamic = 'force-dynamic'

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

    const recentReports = await prisma.report.findMany({
      where: {
        doctorId: session.user.id,
      },
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            dateOfBirth: true,
            gender: true,
          },
        },
      },
      orderBy: {
        examinationDate: 'desc',
      },
      take: 5,
    })

    return NextResponse.json(recentReports)
  } catch (error) {
    console.error('Error fetching recent reports:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Only doctors can create reports
    if (session.user.role !== 'DOCTOR') {
      return new NextResponse('Forbidden: Only doctors can create reports', { status: 403 })
    }

    const body = await request.json()
    const {
      patientId,
      findings,
      impression,
      recommendations,
      examinationDate,
      images,
    } = body

    // Validate required fields
    if (!patientId || !findings || !impression || !examinationDate) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const report = await prisma.report.create({
      data: {
        patientId,
        doctorId: session.user.id,
        findings,
        impression,
        recommendations,
        examinationDate: new Date(examinationDate),
        images,
      },
      include: {
        patient: true,
        doctor: true,
      },
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error creating report:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Only doctors can access reports
    if (session.user.role !== 'DOCTOR') {
      return new NextResponse('Forbidden: Only doctors can access reports', { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Only return reports created by the logged-in doctor
    const reports = await prisma.report.findMany({
      where: {
        doctorId: session.user.id,
        ...(patientId && { patientId }),
        ...(startDate && endDate && {
          examinationDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      },
      include: {
        patient: true,
        doctor: true,
      },
      orderBy: {
        examinationDate: 'desc',
      },
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error('Error fetching reports:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 
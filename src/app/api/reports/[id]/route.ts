import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Only doctors can access reports
    if (session.user.role !== 'DOCTOR') {
      return new NextResponse('Forbidden: Only doctors can access reports', { status: 403 })
    }

    const report = await prisma.report.findUnique({
      where: {
        id: params.id,
      },
      include: {
        patient: true,
        doctor: true,
      },
    })

    if (!report) {
      return new NextResponse('Report not found', { status: 404 })
    }

    // Check if the doctor owns this report
    if (report.doctorId !== session.user.id) {
      return new NextResponse('Forbidden: You do not have access to this report', { status: 403 })
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error fetching report:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Only doctors can update reports
    if (session.user.role !== 'DOCTOR') {
      return new NextResponse('Forbidden: Only doctors can update reports', { status: 403 })
    }

    // First check if the report exists and belongs to the doctor
    const existingReport = await prisma.report.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingReport) {
      return new NextResponse('Report not found', { status: 404 })
    }

    if (existingReport.doctorId !== session.user.id) {
      return new NextResponse('Forbidden: You do not have access to this report', { status: 403 })
    }

    const body = await request.json()
    const {
      findings,
      impression,
      recommendations,
      examinationDate,
      images,
    } = body

    const report = await prisma.report.update({
      where: {
        id: params.id,
      },
      data: {
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
    console.error('Error updating report:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Only doctors can delete reports
    if (session.user.role !== 'DOCTOR') {
      return new NextResponse('Forbidden: Only doctors can delete reports', { status: 403 })
    }

    // First check if the report exists and belongs to the doctor
    const existingReport = await prisma.report.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingReport) {
      return new NextResponse('Report not found', { status: 404 })
    }

    if (existingReport.doctorId !== session.user.id) {
      return new NextResponse('Forbidden: You do not have access to this report', { status: 403 })
    }

    await prisma.report.delete({
      where: {
        id: params.id,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting report:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 
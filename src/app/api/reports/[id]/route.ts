import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '../../auth/[...nextauth]/route'

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
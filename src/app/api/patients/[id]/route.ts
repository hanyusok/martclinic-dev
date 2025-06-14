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

    const patient = await prisma.patient.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!patient) {
      return new NextResponse('Patient not found', { status: 404 })
    }

    return NextResponse.json(patient)
  } catch (error) {
    console.error('Error fetching patient:', error)
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
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phoneNumber,
      email,
      address,
      medicalHistory,
    } = body

    const patient = await prisma.patient.update({
      where: {
        id: params.id,
      },
      data: {
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        phoneNumber,
        email,
        address,
        medicalHistory,
      },
    })

    return NextResponse.json(patient)
  } catch (error) {
    console.error('Error updating patient:', error)
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

    await prisma.patient.delete({
      where: {
        id: params.id,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting patient:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 
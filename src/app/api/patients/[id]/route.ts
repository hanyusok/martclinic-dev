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

    // Only doctors can access patients
    if (session.user.role !== 'DOCTOR') {
      return new NextResponse('Forbidden: Only doctors can access patients', { status: 403 })
    }

    // Check if the doctor has access to this patient (created by doctor OR has reports for patient)
    const patientAccess = await prisma.patient.findFirst({
      where: {
        id: params.id,
        OR: [
          { createdBy: session.user.id }, // Patient created by this doctor
          {
            reports: {
              some: {
                doctorId: session.user.id, // Doctor has reports for this patient
              },
            },
          },
        ],
      },
    })

    if (!patientAccess) {
      return new NextResponse('Forbidden: You do not have access to this patient', { status: 403 })
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

    // Only doctors can update patients
    if (session.user.role !== 'DOCTOR') {
      return new NextResponse('Forbidden: Only doctors can update patients', { status: 403 })
    }

    // Check if the doctor has access to this patient (created by doctor OR has reports for patient)
    const patientAccess = await prisma.patient.findFirst({
      where: {
        id: params.id,
        OR: [
          { createdBy: session.user.id }, // Patient created by this doctor
          {
            reports: {
              some: {
                doctorId: session.user.id, // Doctor has reports for this patient
              },
            },
          },
        ],
      },
    })

    if (!patientAccess) {
      return new NextResponse('Forbidden: You do not have access to this patient', { status: 403 })
    }

    const body = await request.json()
    const {
      fullName,
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
        fullName,
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

    // Only doctors can delete patients
    if (session.user.role !== 'DOCTOR') {
      return new NextResponse('Forbidden: Only doctors can delete patients', { status: 403 })
    }

    // Check if the doctor has access to this patient (created by doctor OR has reports for patient)
    const patientAccess = await prisma.patient.findFirst({
      where: {
        id: params.id,
        OR: [
          { createdBy: session.user.id }, // Patient created by this doctor
          {
            reports: {
              some: {
                doctorId: session.user.id, // Doctor has reports for this patient
              },
            },
          },
        ],
      },
    })

    if (!patientAccess) {
      return new NextResponse('Forbidden: You do not have access to this patient', { status: 403 })
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
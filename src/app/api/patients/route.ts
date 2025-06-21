import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient, Patient } from '@prisma/client'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
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

    // Validate required fields
    if (!fullName || !dateOfBirth || !gender) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const patient = await prisma.patient.create({
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
    console.error('Error creating patient:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    const patients = await prisma.patient.findMany({
      where: search
        ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(patients)
  } catch (error) {
    console.error('Error fetching patients:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 
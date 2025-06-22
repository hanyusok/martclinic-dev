import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { hash, compare } from 'bcrypt'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = await prisma.user.findUnique({
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
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      email,
      licenseNumber,
      institutionName,
      institutionAddress,
      institutionPhone,
      currentPassword,
      newPassword,
    } = body

    // Validate required fields
    if (!name || !email) {
      return new NextResponse('Name and email are required', { status: 400 })
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: session.user.id },
      },
    })

    if (existingUser) {
      return new NextResponse('Email is already taken', { status: 400 })
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
      licenseNumber,
      institutionName,
      institutionAddress,
      institutionPhone,
    }

    // Handle password change if provided
    if (newPassword) {
      if (!currentPassword) {
        return new NextResponse('Current password is required to change password', { status: 400 })
      }

      // Verify current password
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
      })

      if (!currentUser) {
        return new NextResponse('User not found', { status: 404 })
      }

      const isCurrentPasswordValid = await compare(currentPassword, currentUser.password)
      if (!isCurrentPasswordValid) {
        return new NextResponse('Current password is incorrect', { status: 400 })
      }

      // Hash new password
      updateData.password = await hash(newPassword, 12)
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        licenseNumber: true,
        institutionName: true,
        institutionAddress: true,
        institutionPhone: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 
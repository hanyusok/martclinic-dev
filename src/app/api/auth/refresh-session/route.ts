export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { withAuth, responses } from '@/lib/api-utils'
import { prisma } from '@/lib/prisma'

export const POST = withAuth(async (session) => {
  // Fetch fresh user data from database
  const freshUser = await prisma.user.findUnique({
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
    },
  })

  if (!freshUser) {
    return responses.notFound('User not found')
  }

  const response = responses.success({
    user: freshUser,
    message: 'Fresh user data retrieved from database'
  })
  
  // Add cache headers for better performance
  response.headers.set('Cache-Control', 'private, max-age=300') // Cache for 5 minutes
  return response
}) 
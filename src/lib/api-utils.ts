import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Common API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Authentication helper
export async function requireAuth() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    throw new Error('Unauthorized')
  }
  
  return session
}

// Error response helper
export function errorResponse(message: string, status: number = 500): NextResponse {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  )
}

// Success response helper
export function successResponse<T>(data: T, message?: string): NextResponse {
  return NextResponse.json(
    { success: true, data, message },
    { status: 200 }
  )
}

// API route wrapper for common patterns
export function withAuth<T extends any[]>(
  handler: (session: any, ...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      const session = await requireAuth()
      return await handler(session, ...args)
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return errorResponse('Unauthorized', 401)
      }
      console.error('API Error:', error)
      return errorResponse('Internal Server Error', 500)
    }
  }
}

// Common HTTP status responses
export const responses = {
  unauthorized: () => errorResponse('Unauthorized', 401),
  notFound: (message: string = 'Not found') => errorResponse(message, 404),
  badRequest: (message: string = 'Bad request') => errorResponse(message, 400),
  internalError: () => errorResponse('Internal Server Error', 500),
  success: <T>(data: T, message?: string) => successResponse(data, message)
} 
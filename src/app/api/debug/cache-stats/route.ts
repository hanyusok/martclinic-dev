import { NextResponse } from 'next/server'
import { withAuth, responses } from '@/lib/api-utils'
import { userCache } from '@/lib/userCache'

export const GET = withAuth(async (session) => {
  const cacheStats = userCache.getStats()
  
  return responses.success({
    cache: cacheStats,
    timestamp: new Date().toISOString(),
    message: 'Cache statistics retrieved successfully'
  })
}) 
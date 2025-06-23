interface CachedUserData {
  data: any
  timestamp: number
  expiresAt: number
}

class UserDataCache {
  private cache: Map<string, CachedUserData> = new Map()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

  set(key: string, data: any): void {
    const now = Date.now()
    const expiresAt = now + this.CACHE_DURATION
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    })
  }

  get(key: string): any | null {
    const cached = this.cache.get(key)
    
    if (!cached) {
      return null
    }

    // Check if cache has expired
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  clear(): void {
    this.cache.clear()
  }

  invalidate(key: string): void {
    this.cache.delete(key)
  }

  // Get cache stats for debugging
  getStats() {
    const now = Date.now()
    const validEntries = Array.from(this.cache.entries()).filter(([_, cached]) => 
      now <= cached.expiresAt
    )
    
    return {
      totalEntries: this.cache.size,
      validEntries: validEntries.length,
      expiredEntries: this.cache.size - validEntries.length
    }
  }
}

// Create a singleton instance
export const userCache = new UserDataCache()

// Helper function to fetch user data with caching
export async function fetchUserDataWithCache(userId: string): Promise<any> {
  const cacheKey = `user_${userId}`
  
  // Check cache first
  const cachedData = userCache.get(cacheKey)
  if (cachedData) {
    return cachedData
  }

  // Fetch from API if not cached
  try {
    const response = await fetch('/api/profile')
    if (response.ok) {
      const userData = await response.json()
      userCache.set(cacheKey, userData)
      return userData
    }
  } catch (error) {
    console.error('Error fetching user data:', error)
  }

  return null
}

// Helper function to invalidate user cache (call after profile updates)
export function invalidateUserCache(userId: string): void {
  userCache.invalidate(`user_${userId}`)
} 
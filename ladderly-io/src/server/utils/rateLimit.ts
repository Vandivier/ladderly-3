import { TRPCError } from '@trpc/server'

// ============================================================================
// Global API rate limiting (for all tRPC procedures)
// ============================================================================
// Note: Authentication rate limiting is now handled by better-auth's built-in
// rate limiter. This file only contains global API rate limiting for tRPC.

// In-memory cache for tracking API requests
// Key: identifier (IP address or userId), Value: array of timestamps
const apiRequestAttempts = new Map<string, number[]>()

// Clean up old API request entries periodically
setInterval(
  () => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000
    for (const [identifier, attempts] of apiRequestAttempts.entries()) {
      const recentAttempts = attempts.filter(
        (timestamp) => timestamp > oneHourAgo,
      )
      if (recentAttempts.length === 0) {
        apiRequestAttempts.delete(identifier)
      } else {
        apiRequestAttempts.set(identifier, recentAttempts)
      }
    }
  },
  5 * 60 * 1000,
) // Clean up every 5 minutes

type GlobalRateLimitOptions = {
  identifier: string // IP address, userId, or email
  maxRequests?: number // Default to 100 requests
  windowMs?: number // Default to 1 hour
  errorMessage?: string
}

/**
 * Global rate limiting for API requests.
 * Tracks requests by identifier (IP, userId, etc.) and throws if limit exceeded.
 */
export function checkGlobalRateLimit({
  identifier,
  maxRequests = 100,
  windowMs = 60 * 60 * 1000, // 1 hour
  errorMessage,
}: GlobalRateLimitOptions): void {
  const windowStart = Date.now() - windowMs
  const attempts = apiRequestAttempts.get(identifier) ?? []
  const recentAttempts = attempts.filter(
    (timestamp) => timestamp >= windowStart,
  )

  if (recentAttempts.length >= maxRequests) {
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message:
        errorMessage ?? 'Too many requests. Please wait before trying again.',
    })
  }

  // Record this request
  recentAttempts.push(Date.now())
  apiRequestAttempts.set(identifier, recentAttempts)
}

/**
 * Extract IP address from headers
 */
export function getIpAddressFromHeaders(headers: Headers): string {
  const forwardedFor = headers.get('x-forwarded-for')
  const realIp = headers.get('x-real-ip')
  return forwardedFor?.split(',')[0]?.trim() ?? realIp ?? 'unknown'
}

/**
 * Get identifier for rate limiting from context.
 * Prefers userId if available, otherwise falls back to IP address.
 */
export function getRateLimitIdentifier(
  userId: string | number | undefined,
  ipAddress: string | undefined,
): string {
  if (userId) {
    return `user:${userId}`
  }
  if (ipAddress) {
    return `ip:${ipAddress}`
  }
  // Fallback to a generic identifier (shouldn't happen in practice)
  return 'anonymous'
}

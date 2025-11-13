import { TRPCError } from '@trpc/server'
import type { PrismaClient } from '@prisma/client'

// ============================================================================
// Auth-specific rate limiting (for login, signup, password reset)
// ============================================================================

// In-memory cache for tracking failed login attempts by email
// Key: email (lowercase), Value: array of timestamps of failed attempts
const failedLoginAttempts = new Map<string, number[]>()

// In-memory cache for tracking auth attempts by IP address
// Key: IP address, Value: array of timestamps of auth attempts
const authAttemptsByIp = new Map<string, number[]>()

// In-memory cache for whole-service auth rate limiting (all auth operations combined)
// Key: IP address, Value: array of timestamps
const wholeServiceAuthAttempts = new Map<string, number[]>()

// Clean up old entries periodically (older than 1 hour)
setInterval(
  () => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000
    for (const [email, attempts] of failedLoginAttempts.entries()) {
      const recentAttempts = attempts.filter(
        (timestamp) => timestamp > oneHourAgo,
      )
      if (recentAttempts.length === 0) {
        failedLoginAttempts.delete(email)
      } else {
        failedLoginAttempts.set(email, recentAttempts)
      }
    }
    for (const [ip, attempts] of authAttemptsByIp.entries()) {
      const recentAttempts = attempts.filter(
        (timestamp) => timestamp > oneHourAgo,
      )
      if (recentAttempts.length === 0) {
        authAttemptsByIp.delete(ip)
      } else {
        authAttemptsByIp.set(ip, recentAttempts)
      }
    }
  },
  5 * 60 * 1000,
) // Clean up every 5 minutes

// Clean up whole-service auth attempts (older than 1 minute)
setInterval(() => {
  const oneMinuteAgo = Date.now() - 60 * 1000
  for (const [ip, attempts] of wholeServiceAuthAttempts.entries()) {
    const recentAttempts = attempts.filter(
      (timestamp) => timestamp > oneMinuteAgo,
    )
    if (recentAttempts.length === 0) {
      wholeServiceAuthAttempts.delete(ip)
    } else {
      wholeServiceAuthAttempts.set(ip, recentAttempts)
    }
  }
}, 30 * 1000) // Clean up every 30 seconds

/**
 * Record a failed login attempt for rate limiting purposes
 */
export function recordFailedLoginAttempt(
  email: string,
  ipAddress?: string,
): void {
  const lowerEmail = email.toLowerCase()
  const now = Date.now()
  const attempts = failedLoginAttempts.get(lowerEmail) ?? []
  attempts.push(now)
  failedLoginAttempts.set(lowerEmail, attempts)

  // Also track by IP if provided
  if (ipAddress && ipAddress !== 'unknown') {
    const ipAttempts = authAttemptsByIp.get(ipAddress) ?? []
    ipAttempts.push(now)
    authAttemptsByIp.set(ipAddress, ipAttempts)
  }
}

/**
 * Record an auth attempt (signup, login, password reset) by IP for whole-service tracking
 */
export function recordAuthAttemptByIp(ipAddress?: string): void {
  if (!ipAddress || ipAddress === 'unknown') {
    return
  }
  const now = Date.now()
  const attempts = authAttemptsByIp.get(ipAddress) ?? []
  attempts.push(now)
  authAttemptsByIp.set(ipAddress, attempts)
}

type RateLimitOptions = {
  db: PrismaClient
  email?: string // Optional for password_reset when userId is provided
  userId?: number // Optional for password_reset action
  ipAddress?: string // IP address for rate limiting
  maxAttempts?: number // Defaults to 3
  windowMs?: number // Defaults to 1 hour
  action: 'signup' | 'login' | 'password_reset'
  errorMessage?: string
}

/**
 * Check whole-service auth rate limit (all auth operations combined by IP)
 * Limits to 10 auth operations per minute per IP to prevent DDoS
 */
function checkWholeServiceAuthLimit(ipAddress?: string): void {
  if (!ipAddress || ipAddress === 'unknown') {
    return // Skip if no IP available
  }

  const oneMinuteAgo = Date.now() - 60 * 1000
  const attempts = wholeServiceAuthAttempts.get(ipAddress) ?? []
  const recentAttempts = attempts.filter(
    (timestamp) => timestamp >= oneMinuteAgo,
  )

  if (recentAttempts.length >= 10) {
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message:
        'Too many authentication attempts. Please wait before trying again.',
    })
  }

  // Record this attempt
  recentAttempts.push(Date.now())
  wholeServiceAuthAttempts.set(ipAddress, recentAttempts)
}

/**
 * Rate limiting utility for guest users only.
 * Checks if the user has exceeded the maximum number of attempts within the time window.
 * Throws TOO_MANY_REQUESTS error if limit exceeded.
 *
 * For signup: tracks by email OR IP, checks recent user creations
 * For login: tracks by email OR IP, checks recent failed login attempts
 * For password_reset: tracks by userId OR IP, checks recent password reset token creations
 *
 * Also checks whole-service limit: 10 auth operations per minute per IP
 */
export async function checkGuestRateLimit({
  db,
  email,
  userId,
  ipAddress,
  maxAttempts = 3, // Default to 3 attempts
  windowMs = 60 * 60 * 1000, // Default to 1 hour
  action,
  errorMessage,
}: RateLimitOptions): Promise<void> {
  // First check whole-service limit (all auth operations combined)
  checkWholeServiceAuthLimit(ipAddress)

  const windowStart = new Date(Date.now() - windowMs)

  if (action === 'signup') {
    if (!email) {
      throw new Error('Email is required for signup rate limiting')
    }
    const lowerEmail = email.toLowerCase()
    // Check for recent signup attempts by looking for users created with this email
    // Note: This won't catch attempts that failed validation, but will catch successful signups
    // For more accurate tracking, consider creating a RateLimitAttempt table
    const recentSignups = await db.user.count({
      where: {
        email: lowerEmail,
        createdAt: {
          gte: windowStart,
        },
      },
    })

    // Also check by IP address if provided
    let recentIpSignups = 0
    if (ipAddress && ipAddress !== 'unknown') {
      // Count signups from this IP in the time window
      // Note: This requires tracking signup attempts by IP, which we'll add to the tracking
      const ipAttempts = authAttemptsByIp.get(ipAddress) ?? []
      recentIpSignups = ipAttempts.filter(
        (timestamp) => timestamp >= windowStart.getTime(),
      ).length
    }

    // Rate limit if EITHER email OR IP exceeds the limit
    if (recentSignups >= maxAttempts || recentIpSignups >= maxAttempts) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message:
          errorMessage ??
          'Too many signup attempts. Please wait before trying again.',
      })
    }
  } else if (action === 'login') {
    if (!email) {
      throw new Error('Email is required for login rate limiting')
    }
    const lowerEmail = email.toLowerCase()

    // Check in-memory cache for recent failed login attempts by email
    const emailAttempts = failedLoginAttempts.get(lowerEmail) ?? []
    const recentEmailAttempts = emailAttempts.filter(
      (timestamp) => timestamp >= windowStart.getTime(),
    )

    // Also check by IP address if provided (prevents password spray attacks)
    let recentIpAttempts: number[] = []
    if (ipAddress && ipAddress !== 'unknown') {
      const ipAttempts = authAttemptsByIp.get(ipAddress) ?? []
      recentIpAttempts = ipAttempts.filter(
        (timestamp) => timestamp >= windowStart.getTime(),
      )
    }

    // Rate limit if EITHER email OR IP exceeds the limit
    if (
      recentEmailAttempts.length >= maxAttempts ||
      recentIpAttempts.length >= maxAttempts
    ) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message:
          errorMessage ??
          'Too many login attempts. Please wait before trying again.',
      })
    }
  } else if (action === 'password_reset') {
    if (!userId && !email) {
      throw new Error(
        'UserId or email is required for password_reset rate limiting',
      )
    }

    let recentResetAttempts = 0
    if (userId) {
      // Check for recent password reset attempts by userId
      recentResetAttempts = await db.token.count({
        where: {
          userId,
          type: 'RESET_PASSWORD',
          createdAt: {
            gte: windowStart,
          },
        },
      })
    }

    // Also check by IP address if provided (prevents password spray attacks)
    let recentIpAttempts = 0
    if (ipAddress && ipAddress !== 'unknown') {
      const ipAttempts = authAttemptsByIp.get(ipAddress) ?? []
      recentIpAttempts = ipAttempts.filter(
        (timestamp) => timestamp >= windowStart.getTime(),
      ).length
    }

    // Rate limit if EITHER userId OR IP exceeds the limit
    if (recentResetAttempts >= maxAttempts || recentIpAttempts >= maxAttempts) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message:
          errorMessage ??
          'Too many password reset requests. Please wait before requesting another reset.',
      })
    }
  }
}

// ============================================================================
// Global API rate limiting (for all tRPC procedures)
// ============================================================================

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

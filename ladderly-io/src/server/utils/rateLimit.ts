import { TRPCError } from '@trpc/server'
import type { PrismaClient } from '@prisma/client'

type RateLimitOptions = {
  db: PrismaClient
  email?: string // Optional for password_reset when userId is provided
  userId?: number // Optional for password_reset action
  maxAttempts?: number // Defaults to 3
  windowMs?: number // Defaults to 1 hour
  action: 'signup' | 'login' | 'password_reset'
  errorMessage?: string
}

/**
 * Rate limiting utility for guest users only.
 * Checks if the user has exceeded the maximum number of attempts within the time window.
 * Throws TOO_MANY_REQUESTS error if limit exceeded.
 *
 * For signup: tracks by email, checks recent user creations
 * For login: tracks by email, checks recent password reset attempts (as a proxy)
 * For password_reset: tracks by userId, checks recent password reset token creations
 */
export async function checkGuestRateLimit({
  db,
  email,
  userId,
  maxAttempts = 3, // Default to 3 attempts
  windowMs = 60 * 60 * 1000, // Default to 1 hour
  action,
  errorMessage,
}: RateLimitOptions): Promise<void> {
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

    if (recentSignups >= maxAttempts) {
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
    // For login, we track by checking recent password reset attempts
    // This is a proxy indicator of login issues
    const user = await db.user.findUnique({
      where: { email: lowerEmail },
      select: { id: true },
    })

    if (user) {
      const recentResets = await db.token.count({
        where: {
          userId: user.id,
          type: 'RESET_PASSWORD',
          createdAt: {
            gte: windowStart,
          },
        },
      })

      if (recentResets >= maxAttempts) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message:
            errorMessage ??
            'Too many login attempts. Please wait before trying again.',
        })
      }
    }
  } else if (action === 'password_reset') {
    if (!userId) {
      throw new Error('UserId is required for password_reset rate limiting')
    }
    // Check for recent password reset attempts by userId
    const recentResetAttempts = await db.token.count({
      where: {
        userId,
        type: 'RESET_PASSWORD',
        createdAt: {
          gte: windowStart,
        },
      },
    })

    if (recentResetAttempts >= maxAttempts) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message:
          errorMessage ??
          'Too many password reset requests. Please wait before requesting another reset.',
      })
    }
  }
}

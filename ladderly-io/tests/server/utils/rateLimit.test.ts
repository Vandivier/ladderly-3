import { describe, expect, it, vi, beforeEach } from 'vitest'
import { TRPCError } from '@trpc/server'

// Create a mock database object
const mockDb = {
  user: {
    findUnique: vi.fn(),
    count: vi.fn(),
  },
  token: {
    count: vi.fn(),
  },
}

describe('checkGuestRateLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset Date.now mock if it was set
    vi.useRealTimers()
    // Reset modules to get fresh rate limit caches between tests
    vi.resetModules()
  })

  describe('signup action', () => {
    it('allows signup when under rate limit by email', async () => {
      const { checkGuestRateLimit } = await import('~/server/utils/rateLimit')
      mockDb.user.count.mockResolvedValue(2) // Below limit of 3

      await expect(
        checkGuestRateLimit({
          db: mockDb as any,
          email: 'test@example.com',
          action: 'signup',
          maxAttempts: 3,
        }),
      ).resolves.toBeUndefined()

      expect(mockDb.user.count).toHaveBeenCalledWith({
        where: {
          email: 'test@example.com',
          createdAt: expect.any(Object),
        },
      })
    })

    it('allows signup when under rate limit by IP', async () => {
      const { checkGuestRateLimit } = await import('~/server/utils/rateLimit')
      mockDb.user.count.mockResolvedValue(0) // No signups by email
      // No IP attempts recorded yet

      await expect(
        checkGuestRateLimit({
          db: mockDb as any,
          email: 'test@example.com',
          ipAddress: '192.168.1.1',
          action: 'signup',
          maxAttempts: 3,
        }),
      ).resolves.toBeUndefined()
    })

    it('throws error when signup rate limit exceeded by email', async () => {
      const { checkGuestRateLimit } = await import('~/server/utils/rateLimit')
      mockDb.user.count.mockResolvedValue(3) // At limit of 3

      await expect(
        checkGuestRateLimit({
          db: mockDb as any,
          email: 'test@example.com',
          action: 'signup',
          maxAttempts: 3,
        }),
      ).rejects.toThrow(TRPCError)

      await expect(
        checkGuestRateLimit({
          db: mockDb as any,
          email: 'test@example.com',
          action: 'signup',
          maxAttempts: 3,
        }),
      ).rejects.toThrow('Too many signup attempts')
    })

    it('throws error when signup rate limit exceeded by IP', async () => {
      const { checkGuestRateLimit, recordAuthAttemptByIp } = await import(
        '~/server/utils/rateLimit'
      )
      mockDb.user.count.mockResolvedValue(0) // No signups by email
      const ipAddress = '192.168.1.1'
      const now = Date.now()

      // Record 3 signup attempts for this IP
      recordAuthAttemptByIp(ipAddress)
      recordAuthAttemptByIp(ipAddress)
      recordAuthAttemptByIp(ipAddress)

      vi.useFakeTimers()
      vi.setSystemTime(now + 1000)

      await expect(
        checkGuestRateLimit({
          db: mockDb as any,
          email: 'newuser@example.com',
          ipAddress,
          action: 'signup',
          maxAttempts: 3,
          windowMs: 60 * 60 * 1000,
        }),
      ).rejects.toThrow('Too many signup attempts')

      vi.useRealTimers()
    })

    it('uses custom error message when provided', async () => {
      const { checkGuestRateLimit } = await import('~/server/utils/rateLimit')
      mockDb.user.count.mockResolvedValue(3)

      await expect(
        checkGuestRateLimit({
          db: mockDb as any,
          email: 'test@example.com',
          action: 'signup',
          maxAttempts: 3,
          errorMessage: 'Custom rate limit message',
        }),
      ).rejects.toThrow('Custom rate limit message')
    })

    it('throws error when email is missing', async () => {
      const { checkGuestRateLimit } = await import('~/server/utils/rateLimit')
      await expect(
        checkGuestRateLimit({
          db: mockDb as any,
          action: 'signup',
        }),
      ).rejects.toThrow('Email is required for signup rate limiting')
    })

    it('normalizes email to lowercase', async () => {
      const { checkGuestRateLimit } = await import('~/server/utils/rateLimit')
      mockDb.user.count.mockResolvedValue(0)

      await checkGuestRateLimit({
        db: mockDb as any,
        email: 'TEST@EXAMPLE.COM',
        action: 'signup',
      })

      expect(mockDb.user.count).toHaveBeenCalledWith({
        where: {
          email: 'test@example.com',
          createdAt: expect.any(Object),
        },
      })
    })
  })

  describe('login action', () => {
    it('allows login when under rate limit by email', async () => {
      const { checkGuestRateLimit } = await import('~/server/utils/rateLimit')
      // No failed attempts recorded yet
      await expect(
        checkGuestRateLimit({
          db: mockDb as any,
          email: 'test@example.com',
          action: 'login',
          maxAttempts: 3,
        }),
      ).resolves.toBeUndefined()
    })

    it('allows login when under rate limit by IP', async () => {
      const { checkGuestRateLimit } = await import('~/server/utils/rateLimit')
      await expect(
        checkGuestRateLimit({
          db: mockDb as any,
          email: 'test@example.com',
          ipAddress: '192.168.1.1',
          action: 'login',
          maxAttempts: 3,
        }),
      ).resolves.toBeUndefined()
    })

    it('throws error when login rate limit exceeded by email', async () => {
      const { checkGuestRateLimit, recordFailedLoginAttempt } = await import(
        '~/server/utils/rateLimit'
      )
      // Record 3 failed attempts for this email
      const now = Date.now()
      recordFailedLoginAttempt('test@example.com')
      recordFailedLoginAttempt('test@example.com')
      recordFailedLoginAttempt('test@example.com')

      // Mock Date.now to return a time within the window
      vi.useFakeTimers()
      vi.setSystemTime(now + 1000) // 1 second later

      await expect(
        checkGuestRateLimit({
          db: mockDb as any,
          email: 'test@example.com',
          action: 'login',
          maxAttempts: 3,
          windowMs: 60 * 60 * 1000, // 1 hour
        }),
      ).rejects.toThrow(TRPCError)

      await expect(
        checkGuestRateLimit({
          db: mockDb as any,
          email: 'test@example.com',
          action: 'login',
          maxAttempts: 3,
        }),
      ).rejects.toThrow('Too many login attempts')

      vi.useRealTimers()
    })

    it('throws error when login rate limit exceeded by IP', async () => {
      const { checkGuestRateLimit, recordFailedLoginAttempt } = await import(
        '~/server/utils/rateLimit'
      )
      const ipAddress = '192.168.1.1'
      const now = Date.now()

      // Record 3 failed attempts for this IP
      recordFailedLoginAttempt('user1@example.com', ipAddress)
      recordFailedLoginAttempt('user2@example.com', ipAddress)
      recordFailedLoginAttempt('user3@example.com', ipAddress)

      vi.useFakeTimers()
      vi.setSystemTime(now + 1000)

      await expect(
        checkGuestRateLimit({
          db: mockDb as any,
          email: 'newuser@example.com',
          ipAddress,
          action: 'login',
          maxAttempts: 3,
          windowMs: 60 * 60 * 1000,
        }),
      ).rejects.toThrow('Too many login attempts')

      vi.useRealTimers()
    })

    it('throws error when email is missing', async () => {
      const { checkGuestRateLimit } = await import('~/server/utils/rateLimit')
      await expect(
        checkGuestRateLimit({
          db: mockDb as any,
          action: 'login',
        }),
      ).rejects.toThrow('Email is required for login rate limiting')
    })

    it('allows login when rate limit exceeded but outside time window', async () => {
      const { checkGuestRateLimit, recordFailedLoginAttempt } = await import(
        '~/server/utils/rateLimit'
      )
      const now = Date.now()
      recordFailedLoginAttempt('test@example.com')
      recordFailedLoginAttempt('test@example.com')
      recordFailedLoginAttempt('test@example.com')

      // Set time to 2 hours later (outside 1 hour window)
      vi.useFakeTimers()
      vi.setSystemTime(now + 2 * 60 * 60 * 1000)

      await expect(
        checkGuestRateLimit({
          db: mockDb as any,
          email: 'test@example.com',
          action: 'login',
          maxAttempts: 3,
          windowMs: 60 * 60 * 1000,
        }),
      ).resolves.toBeUndefined()

      vi.useRealTimers()
    })
  })

  describe('password_reset action', () => {
    it('allows password reset when under rate limit by userId', async () => {
      const { checkGuestRateLimit } = await import('~/server/utils/rateLimit')
      mockDb.token.count.mockResolvedValue(2) // Below limit of 3

      await expect(
        checkGuestRateLimit({
          db: mockDb as any,
          userId: 1,
          action: 'password_reset',
          maxAttempts: 3,
        }),
      ).resolves.toBeUndefined()

      expect(mockDb.token.count).toHaveBeenCalledWith({
        where: {
          userId: 1,
          type: 'RESET_PASSWORD',
          createdAt: expect.any(Object),
        },
      })
    })

    it('allows password reset when under rate limit by IP', async () => {
      const { checkGuestRateLimit } = await import('~/server/utils/rateLimit')
      mockDb.token.count.mockResolvedValue(0) // No resets by userId
      // No IP attempts recorded yet

      await expect(
        checkGuestRateLimit({
          db: mockDb as any,
          userId: 1,
          email: 'test@example.com',
          ipAddress: '192.168.1.1',
          action: 'password_reset',
          maxAttempts: 3,
        }),
      ).resolves.toBeUndefined()
    })

    it('throws error when password reset rate limit exceeded by userId', async () => {
      const { checkGuestRateLimit } = await import('~/server/utils/rateLimit')
      mockDb.token.count.mockResolvedValue(3) // At limit of 3

      await expect(
        checkGuestRateLimit({
          db: mockDb as any,
          userId: 1,
          action: 'password_reset',
          maxAttempts: 3,
        }),
      ).rejects.toThrow(TRPCError)

      await expect(
        checkGuestRateLimit({
          db: mockDb as any,
          userId: 1,
          action: 'password_reset',
          maxAttempts: 3,
        }),
      ).rejects.toThrow('Too many password reset requests')
    })

    it('throws error when password reset rate limit exceeded by IP', async () => {
      const { checkGuestRateLimit, recordAuthAttemptByIp } = await import(
        '~/server/utils/rateLimit'
      )
      mockDb.token.count.mockResolvedValue(0) // No resets by userId
      const ipAddress = '192.168.1.1'
      const now = Date.now()

      // Record 3 password reset attempts for this IP
      recordAuthAttemptByIp(ipAddress)
      recordAuthAttemptByIp(ipAddress)
      recordAuthAttemptByIp(ipAddress)

      vi.useFakeTimers()
      vi.setSystemTime(now + 1000)

      await expect(
        checkGuestRateLimit({
          db: mockDb as any,
          userId: 1,
          email: 'test@example.com',
          ipAddress,
          action: 'password_reset',
          maxAttempts: 3,
          windowMs: 60 * 60 * 1000,
        }),
      ).rejects.toThrow('Too many password reset requests')

      vi.useRealTimers()
    })

    it('throws error when userId and email are both missing', async () => {
      const { checkGuestRateLimit } = await import('~/server/utils/rateLimit')
      await expect(
        checkGuestRateLimit({
          db: mockDb as any,
          action: 'password_reset',
        }),
      ).rejects.toThrow(
        'UserId or email is required for password_reset rate limiting',
      )
    })
  })

  describe('time window', () => {
    it('uses default 1 hour window', async () => {
      const { checkGuestRateLimit } = await import('~/server/utils/rateLimit')
      vi.useFakeTimers()
      const now = new Date('2024-01-01T12:00:00Z')
      vi.setSystemTime(now)

      mockDb.user.count.mockResolvedValue(0)

      await checkGuestRateLimit({
        db: mockDb as any,
        email: 'test@example.com',
        action: 'signup',
      })

      const callArgs = mockDb.user.count.mock.calls[0]?.[0]
      const windowStart = callArgs?.where?.createdAt?.gte

      expect(windowStart).toBeInstanceOf(Date)
      // Should be approximately 1 hour before now (allowing for small timing differences)
      const expectedTime = new Date(now.getTime() - 60 * 60 * 1000)
      const timeDiff = Math.abs(windowStart.getTime() - expectedTime.getTime())
      expect(timeDiff).toBeLessThan(1000) // Within 1 second

      vi.useRealTimers()
    })

    it('uses custom window when provided', async () => {
      const { checkGuestRateLimit } = await import('~/server/utils/rateLimit')
      vi.useFakeTimers()
      const now = new Date('2024-01-01T12:00:00Z')
      vi.setSystemTime(now)

      mockDb.user.count.mockResolvedValue(0)

      await checkGuestRateLimit({
        db: mockDb as any,
        email: 'test@example.com',
        action: 'signup',
        windowMs: 30 * 60 * 1000, // 30 minutes
      })

      const callArgs = mockDb.user.count.mock.calls[0]?.[0]
      const windowStart = callArgs?.where?.createdAt?.gte

      expect(windowStart).toBeInstanceOf(Date)
      const expectedTime = new Date(now.getTime() - 30 * 60 * 1000)
      const timeDiff = Math.abs(windowStart.getTime() - expectedTime.getTime())
      expect(timeDiff).toBeLessThan(1000)

      vi.useRealTimers()
    })
  })

  describe('default values', () => {
    it('uses default maxAttempts of 3', async () => {
      const { checkGuestRateLimit } = await import('~/server/utils/rateLimit')
      mockDb.user.count.mockResolvedValue(3) // At default limit

      await expect(
        checkGuestRateLimit({
          db: mockDb as any,
          email: 'test@example.com',
          action: 'signup',
          // maxAttempts not provided, should default to 3
        }),
      ).rejects.toThrow()
    })

    it('uses default windowMs of 1 hour', async () => {
      const { checkGuestRateLimit } = await import('~/server/utils/rateLimit')
      vi.useFakeTimers()
      const now = new Date('2024-01-01T12:00:00Z')
      vi.setSystemTime(now)

      mockDb.user.count.mockResolvedValue(0)

      await checkGuestRateLimit({
        db: mockDb as any,
        email: 'test@example.com',
        action: 'signup',
        // windowMs not provided, should default to 1 hour
      })

      const callArgs = mockDb.user.count.mock.calls[0]?.[0]
      const windowStart = callArgs?.where?.createdAt?.gte
      const expectedTime = new Date(now.getTime() - 60 * 60 * 1000)
      const timeDiff = Math.abs(windowStart.getTime() - expectedTime.getTime())
      expect(timeDiff).toBeLessThan(1000)

      vi.useRealTimers()
    })
  })

  describe('whole-service auth rate limiting', () => {
    it('allows auth operations when under whole-service limit', async () => {
      const { checkGuestRateLimit } = await import('~/server/utils/rateLimit')
      // No whole-service attempts recorded yet
      await expect(
        checkGuestRateLimit({
          db: mockDb as any,
          email: 'test@example.com',
          ipAddress: '192.168.1.1',
          action: 'login',
        }),
      ).resolves.toBeUndefined()
    })

    it('throws error when whole-service limit exceeded (10 per minute)', async () => {
      const { checkGuestRateLimit } = await import('~/server/utils/rateLimit')
      const ipAddress = '192.168.1.1'
      const now = Date.now()

      vi.useFakeTimers()
      vi.setSystemTime(now)

      // Make 10 auth attempts (each call to checkGuestRateLimit records to wholeServiceAuthAttempts)
      for (let i = 0; i < 10; i++) {
        await checkGuestRateLimit({
          db: mockDb as any,
          email: `test${i}@example.com`,
          ipAddress,
          action: 'login',
        })
      }

      // Now the 11th attempt should fail
      vi.setSystemTime(now + 1000) // 1 second later

      await expect(
        checkGuestRateLimit({
          db: mockDb as any,
          email: 'test11@example.com',
          ipAddress,
          action: 'login',
        }),
      ).rejects.toThrow('Too many authentication attempts')

      vi.useRealTimers()
    })

    it('allows auth operations when whole-service limit exceeded but outside time window', async () => {
      const { checkGuestRateLimit } = await import('~/server/utils/rateLimit')
      const ipAddress = '192.168.1.1'
      const now = Date.now()

      vi.useFakeTimers()
      vi.setSystemTime(now)

      // Make 10 auth attempts
      for (let i = 0; i < 10; i++) {
        await checkGuestRateLimit({
          db: mockDb as any,
          email: `test${i}@example.com`,
          ipAddress,
          action: 'login',
        })
      }

      // Set time to 2 minutes later (outside 1 minute window)
      vi.setSystemTime(now + 2 * 60 * 1000)

      await expect(
        checkGuestRateLimit({
          db: mockDb as any,
          email: 'test@example.com',
          ipAddress,
          action: 'login',
        }),
      ).resolves.toBeUndefined()

      vi.useRealTimers()
    })

    it('skips whole-service limit check when IP is unknown', async () => {
      const { checkGuestRateLimit } = await import('~/server/utils/rateLimit')
      mockDb.user.count.mockResolvedValue(0)

      await expect(
        checkGuestRateLimit({
          db: mockDb as any,
          email: 'test@example.com',
          ipAddress: 'unknown',
          action: 'signup',
        }),
      ).resolves.toBeUndefined()
    })

    it('applies whole-service limit across different auth actions', async () => {
      const { checkGuestRateLimit } = await import('~/server/utils/rateLimit')
      const ipAddress = '192.168.1.1'
      const now = Date.now()

      vi.useFakeTimers()
      vi.setSystemTime(now)

      // Mix of login, signup, and password reset attempts
      for (let i = 0; i < 5; i++) {
        await checkGuestRateLimit({
          db: mockDb as any,
          email: `login${i}@example.com`,
          ipAddress,
          action: 'login',
        })
      }

      mockDb.user.count.mockResolvedValue(0)
      for (let i = 0; i < 3; i++) {
        await checkGuestRateLimit({
          db: mockDb as any,
          email: `signup${i}@example.com`,
          ipAddress,
          action: 'signup',
        })
      }

      mockDb.token.count.mockResolvedValue(0)
      for (let i = 0; i < 2; i++) {
        await checkGuestRateLimit({
          db: mockDb as any,
          userId: i + 1,
          email: `reset${i}@example.com`,
          ipAddress,
          action: 'password_reset',
        })
      }

      // Total: 10 attempts, so 11th should fail
      vi.setSystemTime(now + 1000)

      await expect(
        checkGuestRateLimit({
          db: mockDb as any,
          email: 'final@example.com',
          ipAddress,
          action: 'login',
        }),
      ).rejects.toThrow('Too many authentication attempts')

      vi.useRealTimers()
    })
  })

  describe('getIpAddressFromHeaders', () => {
    it('extracts IP from x-forwarded-for header', async () => {
      const { getIpAddressFromHeaders } = await import(
        '~/server/utils/rateLimit'
      )
      const headers = new Headers()
      headers.set('x-forwarded-for', '192.168.1.1, 10.0.0.1')

      const ip = getIpAddressFromHeaders(headers)
      expect(ip).toBe('192.168.1.1')
    })

    it('extracts IP from x-real-ip header when x-forwarded-for is missing', async () => {
      const { getIpAddressFromHeaders } = await import(
        '~/server/utils/rateLimit'
      )
      const headers = new Headers()
      headers.set('x-real-ip', '192.168.1.2')

      const ip = getIpAddressFromHeaders(headers)
      expect(ip).toBe('192.168.1.2')
    })

    it('returns unknown when no IP headers are present', async () => {
      const { getIpAddressFromHeaders } = await import(
        '~/server/utils/rateLimit'
      )
      const headers = new Headers()

      const ip = getIpAddressFromHeaders(headers)
      expect(ip).toBe('unknown')
    })

    it('prefers x-forwarded-for over x-real-ip', async () => {
      const { getIpAddressFromHeaders } = await import(
        '~/server/utils/rateLimit'
      )
      const headers = new Headers()
      headers.set('x-forwarded-for', '192.168.1.1')
      headers.set('x-real-ip', '192.168.1.2')

      const ip = getIpAddressFromHeaders(headers)
      expect(ip).toBe('192.168.1.1')
    })
  })
})

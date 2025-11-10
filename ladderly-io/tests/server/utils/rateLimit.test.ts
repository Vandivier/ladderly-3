import { describe, expect, it, vi, beforeEach } from 'vitest'
import { TRPCError } from '@trpc/server'
import { checkGuestRateLimit } from '~/server/utils/rateLimit'

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
  })

  describe('signup action', () => {
    it('allows signup when under rate limit', async () => {
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

    it('throws error when signup rate limit exceeded', async () => {
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

    it('uses custom error message when provided', async () => {
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
      await expect(
        checkGuestRateLimit({
          db: mockDb as any,
          action: 'signup',
        }),
      ).rejects.toThrow('Email is required for signup rate limiting')
    })

    it('normalizes email to lowercase', async () => {
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
    it('allows login when under rate limit', async () => {
      const mockUser = { id: 1 }
      mockDb.user.findUnique.mockResolvedValue(mockUser)
      mockDb.token.count.mockResolvedValue(2) // Below limit of 3

      await expect(
        checkGuestRateLimit({
          db: mockDb as any,
          email: 'test@example.com',
          action: 'login',
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

    it('allows login when user does not exist', async () => {
      mockDb.user.findUnique.mockResolvedValue(null)

      await expect(
        checkGuestRateLimit({
          db: mockDb as any,
          email: 'nonexistent@example.com',
          action: 'login',
          maxAttempts: 3,
        }),
      ).resolves.toBeUndefined()

      expect(mockDb.token.count).not.toHaveBeenCalled()
    })

    it('throws error when login rate limit exceeded', async () => {
      const mockUser = { id: 1 }
      mockDb.user.findUnique.mockResolvedValue(mockUser)
      mockDb.token.count.mockResolvedValue(3) // At limit of 3

      await expect(
        checkGuestRateLimit({
          db: mockDb as any,
          email: 'test@example.com',
          action: 'login',
          maxAttempts: 3,
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
    })

    it('throws error when email is missing', async () => {
      await expect(
        checkGuestRateLimit({
          db: mockDb as any,
          action: 'login',
        }),
      ).rejects.toThrow('Email is required for login rate limiting')
    })
  })

  describe('password_reset action', () => {
    it('allows password reset when under rate limit', async () => {
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

    it('throws error when password reset rate limit exceeded', async () => {
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

    it('throws error when userId is missing', async () => {
      await expect(
        checkGuestRateLimit({
          db: mockDb as any,
          action: 'password_reset',
        }),
      ).rejects.toThrow('UserId is required for password_reset rate limiting')
    })
  })

  describe('time window', () => {
    it('uses default 1 hour window', async () => {
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
})

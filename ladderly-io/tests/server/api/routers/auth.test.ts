import { describe, expect, it, vi, beforeEach } from 'vitest'
import { TRPCError } from '@trpc/server'
import { checkGuestRateLimit } from '~/server/utils/rateLimit'
import { sendForgotPasswordEmail } from '~/server/mailers/forgotPasswordMailer'
import { sendVerificationEmail } from '~/server/mailers/verifyEmailMailer'

// Mock the rate limit utility
vi.mock('~/server/utils/rateLimit', () => ({
  checkGuestRateLimit: vi.fn(),
  getIpAddressFromHeaders: vi.fn((headers: Headers) => {
    const forwardedFor = headers.get('x-forwarded-for')
    const realIp = headers.get('x-real-ip')
    return forwardedFor?.split(',')[0]?.trim() ?? realIp ?? 'unknown'
  }),
  recordAuthAttemptByIp: vi.fn(),
}))

// Mock the forgot password mailer
vi.mock('~/server/mailers/forgotPasswordMailer', () => ({
  sendForgotPasswordEmail: vi.fn(),
}))

// Mock the verification email mailer
vi.mock('~/server/mailers/verifyEmailMailer', () => ({
  sendVerificationEmail: vi.fn(),
}))

// Mock crypto
vi.mock('crypto', () => ({
  default: {
    randomBytes: vi.fn(() => ({
      toString: () => 'mock-token-hex',
    })),
    createHash: vi.fn(() => ({
      update: vi.fn(() => ({
        digest: vi.fn(() => 'mock-hashed-token'),
      })),
    })),
  },
}))

// Create a mock database object
const mockDb = {
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  token: {
    create: vi.fn(),
    findFirst: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
}

// Mock the database module
vi.mock('~/server/db', () => ({
  db: mockDb,
}))

// Mock argon2
vi.mock('argon2', () => ({
  hash: vi.fn((password) => Promise.resolve(`hashed-${password}`)),
  verify: vi.fn(() => Promise.resolve(true)),
}))

// Import after mocking
import { authRouter } from '~/server/api/routers/auth'

// Create a simple caller for testing
const createCaller = (ctx: any): any => {
  const caller: any = {}

  // Map each procedure in the router to a function that calls it with the context
  Object.entries(authRouter).forEach(([key, procedure]: [string, any]) => {
    caller[key] = async (input: any) => {
      return procedure.mutation
        ? procedure.mutation({ ctx, input })
        : procedure({ ctx, input })
    }
  })

  return caller
}

describe('authRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('forgotPassword', () => {
    it('sends password reset email when user exists', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
      }

      mockDb.user.findUnique.mockResolvedValue(mockUser)
      vi.mocked(checkGuestRateLimit).mockResolvedValue(undefined)
      mockDb.token.create.mockResolvedValue({ id: 1 })
      vi.mocked(sendForgotPasswordEmail).mockResolvedValue(undefined)

      const caller = createCaller({
        db: mockDb,
        session: null, // Guest user
        headers: new Headers(),
      })

      const result = await caller.forgotPassword({ email: 'test@example.com' })

      expect(result).toEqual({ success: true })
      expect(checkGuestRateLimit).toHaveBeenCalledWith({
        db: mockDb,
        userId: 1,
        email: 'test@example.com',
        ipAddress: 'unknown',
        action: 'password_reset',
      })
      expect(sendForgotPasswordEmail).toHaveBeenCalled()
    })

    it('throws rate limit error when too many attempts', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
      }

      mockDb.user.findUnique.mockResolvedValue(mockUser)
      vi.mocked(checkGuestRateLimit).mockRejectedValue(
        new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message:
            'Too many password reset requests. Please wait before requesting another reset.',
        }),
      )

      const caller = createCaller({
        db: mockDb,
        session: null, // Guest user
        headers: new Headers(),
      })

      await expect(
        caller.forgotPassword({ email: 'test@example.com' }),
      ).rejects.toThrow('Too many password reset requests')

      expect(sendForgotPasswordEmail).not.toHaveBeenCalled()
    })

    it('does not rate limit authenticated users', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
      }

      mockDb.user.findUnique.mockResolvedValue(mockUser)
      mockDb.token.create.mockResolvedValue({ id: 1 })
      vi.mocked(sendForgotPasswordEmail).mockResolvedValue(undefined)

      const caller = createCaller({
        db: mockDb,
        session: {
          user: {
            id: '1',
            email: 'test@example.com',
          },
        },
        headers: new Headers(),
      })

      const result = await caller.forgotPassword({ email: 'test@example.com' })

      expect(result).toEqual({ success: true })
      expect(checkGuestRateLimit).not.toHaveBeenCalled()
      expect(sendForgotPasswordEmail).toHaveBeenCalled()
    })

    it('returns success message even if user does not exist (security)', async () => {
      mockDb.user.findUnique.mockResolvedValue(null)

      const caller = createCaller({
        db: mockDb,
        session: null,
        headers: new Headers(),
      })

      await expect(
        caller.forgotPassword({ email: 'nonexistent@example.com' }),
      ).rejects.toThrow('If your email is in our system')

      expect(checkGuestRateLimit).not.toHaveBeenCalled()
      expect(sendForgotPasswordEmail).not.toHaveBeenCalled()
    })
  })

  describe('signup', () => {
    it('creates user when email does not exist', async () => {
      mockDb.user.findUnique.mockResolvedValue(null)
      vi.mocked(checkGuestRateLimit).mockResolvedValue(undefined)
      mockDb.user.create.mockResolvedValue({
        id: 1,
        email: 'newuser@example.com',
      })

      const caller = createCaller({
        db: mockDb,
        session: null, // Guest user
        headers: new Headers(),
      })

      const result = await caller.signup({
        email: 'newuser@example.com',
        password: 'password123',
      })

      expect(result).toEqual({ success: true, userId: 1 })
      expect(checkGuestRateLimit).toHaveBeenCalledWith({
        db: mockDb,
        email: 'newuser@example.com',
        ipAddress: 'unknown',
        action: 'signup',
        errorMessage:
          'Too many signup attempts. Please wait before trying again.',
      })
    })

    it('throws rate limit error when too many signup attempts', async () => {
      mockDb.user.findUnique.mockResolvedValue(null)
      vi.mocked(checkGuestRateLimit).mockRejectedValue(
        new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many signup attempts. Please wait before trying again.',
        }),
      )

      const caller = createCaller({
        db: mockDb,
        session: null, // Guest user
        headers: new Headers(),
      })

      await expect(
        caller.signup({
          email: 'newuser@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow('Too many signup attempts')

      expect(mockDb.user.create).not.toHaveBeenCalled()
    })

    it('throws error when user already exists', async () => {
      mockDb.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'existing@example.com',
      })
      vi.mocked(checkGuestRateLimit).mockResolvedValue(undefined)

      const caller = createCaller({
        db: mockDb,
        session: null,
        headers: new Headers(),
      })

      await expect(
        caller.signup({
          email: 'existing@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow('User already exists')

      expect(mockDb.user.create).not.toHaveBeenCalled()
    })
  })

  describe('validateCredentials', () => {
    it('returns user when credentials are valid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        nameFirst: 'Test',
        nameLast: 'User',
      }

      mockDb.user.findFirst.mockResolvedValue(mockUser)
      vi.mocked(checkGuestRateLimit).mockResolvedValue(undefined)

      const caller = createCaller({
        db: mockDb,
        session: null, // Guest user
        headers: new Headers(),
      })

      const result = await caller.validateCredentials({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result).toEqual(mockUser)
      expect(checkGuestRateLimit).toHaveBeenCalledWith({
        db: mockDb,
        email: 'test@example.com',
        ipAddress: 'unknown',
        action: 'login',
        errorMessage:
          'Too many login attempts. Please wait before trying again.',
      })
    })

    it('throws rate limit error when too many login attempts', async () => {
      vi.mocked(checkGuestRateLimit).mockRejectedValue(
        new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many login attempts. Please wait before trying again.',
        }),
      )

      const caller = createCaller({
        db: mockDb,
        session: null, // Guest user
        headers: new Headers(),
      })

      await expect(
        caller.validateCredentials({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow('Too many login attempts')

      expect(mockDb.user.findFirst).not.toHaveBeenCalled()
    })

    it('does not rate limit authenticated users', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        nameFirst: 'Test',
        nameLast: 'User',
      }

      mockDb.user.findFirst.mockResolvedValue(mockUser)

      const caller = createCaller({
        db: mockDb,
        session: {
          user: {
            id: '1',
            email: 'test@example.com',
          },
        },
        headers: new Headers(),
      })

      const result = await caller.validateCredentials({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(result).toEqual(mockUser)
      expect(checkGuestRateLimit).not.toHaveBeenCalled()
    })

    it('throws error when user does not exist', async () => {
      mockDb.user.findFirst.mockResolvedValue(null)
      vi.mocked(checkGuestRateLimit).mockResolvedValue(undefined)

      const caller = createCaller({
        db: mockDb,
        session: null,
        headers: new Headers(),
      })

      await expect(
        caller.validateCredentials({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow('Invalid email or password')
    })
  })

  describe('resetPassword', () => {
    it('resets password when token is valid', async () => {
      const mockToken = {
        id: 1,
        userId: 1,
        hashedToken: 'mock-hashed-token',
        type: 'RESET_PASSWORD',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
      }

      mockDb.token.findFirst.mockResolvedValue(mockToken)
      mockDb.user.update.mockResolvedValue({ id: 1 })
      mockDb.token.delete.mockResolvedValue(mockToken)

      const caller = createCaller({
        db: mockDb,
        session: null,
        headers: new Headers(),
      })

      const result = await caller.resetPassword({
        token: 'valid-token',
        password: 'newpassword123',
        passwordConfirmation: 'newpassword123',
      })

      expect(result).toEqual({ success: true })
      expect(mockDb.user.update).toHaveBeenCalled()
      expect(mockDb.token.delete).toHaveBeenCalled()
    })

    it('throws error when passwords do not match', async () => {
      const caller = createCaller({
        db: mockDb,
        session: null,
        headers: new Headers(),
      })

      await expect(
        caller.resetPassword({
          token: 'valid-token',
          password: 'newpassword123',
          passwordConfirmation: 'differentpassword',
        }),
      ).rejects.toThrow('Passwords do not match')

      expect(mockDb.user.update).not.toHaveBeenCalled()
    })

    it('throws error when token is invalid or expired', async () => {
      mockDb.token.findFirst.mockResolvedValue(null)

      const caller = createCaller({
        db: mockDb,
        session: null,
        headers: new Headers(),
      })

      await expect(
        caller.resetPassword({
          token: 'invalid-token',
          password: 'newpassword123',
          passwordConfirmation: 'newpassword123',
        }),
      ).rejects.toThrow('Invalid or expired token')

      expect(mockDb.user.update).not.toHaveBeenCalled()
    })
  })

  describe('sendVerificationEmail', () => {
    it('sends verification email when user exists and email is not verified', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        emailVerified: null,
      }

      mockDb.user.findUnique.mockResolvedValue(mockUser)
      vi.mocked(checkGuestRateLimit).mockResolvedValue(undefined)
      mockDb.token.create.mockResolvedValue({ id: 1 })
      vi.mocked(sendVerificationEmail).mockResolvedValue(undefined)

      const caller = createCaller({
        db: mockDb,
        session: {
          user: {
            id: '1',
            email: 'test@example.com',
          },
        },
        headers: new Headers(),
      })

      const result = await caller.sendVerificationEmail()

      expect(result).toEqual({ success: true })
      expect(mockDb.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      })
      expect(checkGuestRateLimit).toHaveBeenCalledWith({
        db: mockDb,
        userId: 1,
        email: 'test@example.com',
        ipAddress: 'unknown',
        action: 'verify_email',
        errorMessage:
          'Too many verification email requests. Please wait before requesting another email.',
      })
      expect(sendVerificationEmail).toHaveBeenCalled()
    })

    it('throws error when user email is already verified', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        emailVerified: new Date(),
      }

      mockDb.user.findUnique.mockResolvedValue(mockUser)

      const caller = createCaller({
        db: mockDb,
        session: {
          user: {
            id: '1',
            email: 'test@example.com',
          },
        },
        headers: new Headers(),
      })

      await expect(caller.sendVerificationEmail()).rejects.toThrow(
        'Email is already verified',
      )

      expect(sendVerificationEmail).not.toHaveBeenCalled()
    })

    it('throws rate limit error when too many attempts', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        emailVerified: null,
      }

      mockDb.user.findUnique.mockResolvedValue(mockUser)
      vi.mocked(checkGuestRateLimit).mockRejectedValue(
        new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message:
            'Too many verification email requests. Please wait before requesting another email.',
        }),
      )

      const caller = createCaller({
        db: mockDb,
        session: {
          user: {
            id: '1',
            email: 'test@example.com',
          },
        },
        headers: new Headers(),
      })

      await expect(caller.sendVerificationEmail()).rejects.toThrow(
        'Too many verification email requests',
      )

      expect(sendVerificationEmail).not.toHaveBeenCalled()
    })

    it('throws error when user is not found', async () => {
      mockDb.user.findUnique.mockResolvedValue(null)

      const caller = createCaller({
        db: mockDb,
        session: {
          user: {
            id: '999',
            email: 'nonexistent@example.com',
          },
        },
        headers: new Headers(),
      })

      await expect(caller.sendVerificationEmail()).rejects.toThrow(
        'User not found',
      )
    })
  })

  describe('verifyEmail', () => {
    it('verifies email when token is valid', async () => {
      const mockToken = {
        id: 1,
        userId: 1,
        hashedToken: 'mock-hashed-token',
        type: 'VERIFY_EMAIL',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      }

      mockDb.token.findFirst.mockResolvedValue(mockToken)
      mockDb.user.update.mockResolvedValue({ id: 1 })
      mockDb.token.delete.mockResolvedValue(mockToken)

      const caller = createCaller({
        db: mockDb,
        session: null,
        headers: new Headers(),
      })

      const result = await caller.verifyEmail({ token: 'valid-token' })

      expect(result).toEqual({ success: true })
      expect(mockDb.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { emailVerified: expect.any(Date) },
      })
      expect(mockDb.token.delete).toHaveBeenCalledWith({ where: { id: 1 } })
    })

    it('throws error when token is invalid or expired', async () => {
      mockDb.token.findFirst.mockResolvedValue(null)

      const caller = createCaller({
        db: mockDb,
        session: null,
        headers: new Headers(),
      })

      await expect(
        caller.verifyEmail({ token: 'invalid-token' }),
      ).rejects.toThrow('Invalid or expired verification token')

      expect(mockDb.user.update).not.toHaveBeenCalled()
    })
  })
})

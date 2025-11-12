import { describe, expect, it, vi, beforeEach } from 'vitest'
import { LadderlyMigrationAdapter } from '~/server/LadderlyMigrationAdapter'
import type { PrismaClient } from '@prisma/client'
import type {
  AdapterAccount,
  AdapterUser,
  AdapterSession,
  VerificationToken,
} from '@auth/core/adapters'

describe('LadderlyMigrationAdapter', () => {
  let mockPrisma: PrismaClient
  let adapter: ReturnType<typeof LadderlyMigrationAdapter>

  beforeEach(() => {
    vi.clearAllMocks()

    mockPrisma = {
      user: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      account: {
        create: vi.fn(),
        findUnique: vi.fn(),
        delete: vi.fn(),
      },
      session: {
        update: vi.fn(),
        delete: vi.fn(),
      },
      verificationToken: {
        create: vi.fn(),
        delete: vi.fn(),
      },
    } as unknown as PrismaClient

    adapter = LadderlyMigrationAdapter(mockPrisma)
  })

  describe('createUser', () => {
    it('creates a user with all fields', async () => {
      const adapterUser: AdapterUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        emailVerified: new Date('2024-01-01'),
        image: 'https://example.com/image.jpg',
      }

      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        emailVerified: new Date('2024-01-01'),
        image: 'https://example.com/image.jpg',
        nameFirst: 'John',
        nameLast: 'Doe',
        emailBackup: 'john@example.com',
        emailStripe: 'john@example.com',
      }

      vi.mocked(mockPrisma.user.create).mockResolvedValue(mockUser as any)

      const result = await adapter.createUser(adapterUser)

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          emailVerified: new Date('2024-01-01'),
          image: 'https://example.com/image.jpg',
          nameFirst: 'John',
          nameLast: 'Doe',
          emailBackup: 'john@example.com',
          emailStripe: 'john@example.com',
        },
      })

      expect(result).toEqual({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        emailVerified: new Date('2024-01-01'),
        image: 'https://example.com/image.jpg',
      })
    })

    it('handles user with null name', async () => {
      const adapterUser: AdapterUser = {
        id: '1',
        name: null,
        email: 'john@example.com',
        emailVerified: null,
        image: null,
      }

      const mockUser = {
        id: 1,
        name: null,
        email: 'john@example.com',
        emailVerified: null,
        image: null,
        nameFirst: undefined,
        nameLast: undefined,
        emailBackup: 'john@example.com',
        emailStripe: 'john@example.com',
      }

      vi.mocked(mockPrisma.user.create).mockResolvedValue(mockUser as any)

      const result = await adapter.createUser(adapterUser)

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          name: undefined,
          email: 'john@example.com',
          emailVerified: null,
          image: null,
          nameFirst: undefined,
          nameLast: undefined,
          emailBackup: 'john@example.com',
          emailStripe: 'john@example.com',
        },
      })

      expect(result.name).toBeNull()
      expect(result.emailVerified).toBeNull()
      expect(result.image).toBeNull()
    })

    it('handles single-word name', async () => {
      const adapterUser: AdapterUser = {
        id: '1',
        name: 'John',
        email: 'john@example.com',
        emailVerified: null,
        image: null,
      }

      const mockUser = {
        id: 1,
        name: 'John',
        email: 'john@example.com',
        nameFirst: 'John',
        nameLast: undefined,
        emailBackup: 'john@example.com',
        emailStripe: 'john@example.com',
      }

      vi.mocked(mockPrisma.user.create).mockResolvedValue(mockUser as any)

      await adapter.createUser(adapterUser)

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          nameFirst: 'John',
          nameLast: '', // Empty string when no last name
        }),
      })
    })
  })

  describe('getUser', () => {
    it('returns user when found', async () => {
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        emailVerified: new Date('2024-01-01'),
        image: 'https://example.com/image.jpg',
      }

      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(mockUser as any)

      const result = await adapter.getUser('1')

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      })

      expect(result).toEqual({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        emailVerified: new Date('2024-01-01'),
        image: 'https://example.com/image.jpg',
      })
    })

    it('returns null when user not found', async () => {
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null)

      const result = await adapter.getUser('1')

      expect(result).toBeNull()
    })
  })

  describe('getUserByEmail', () => {
    it('returns user when found by email', async () => {
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        emailVerified: null,
        image: null,
      }

      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(mockUser as any)

      const result = await adapter.getUserByEmail('john@example.com')

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      })

      expect(result).toEqual({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        emailVerified: null,
        image: null,
      })
    })

    it('returns null when user not found', async () => {
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null)

      const result = await adapter.getUserByEmail('notfound@example.com')

      expect(result).toBeNull()
    })
  })

  describe('getUserByAccount', () => {
    it('returns user when account found', async () => {
      const mockAccount = {
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          emailVerified: null,
          image: null,
        },
      }

      vi.mocked(mockPrisma.account.findUnique).mockResolvedValue(
        mockAccount as any,
      )

      const result = await adapter.getUserByAccount({
        provider: 'google',
        providerAccountId: '123',
      })

      expect(mockPrisma.account.findUnique).toHaveBeenCalledWith({
        where: {
          provider_providerAccountId: {
            provider: 'google',
            providerAccountId: '123',
          },
        },
        include: { user: true },
      })

      expect(result).toEqual({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        emailVerified: null,
        image: null,
      })
    })

    it('returns null when account not found', async () => {
      vi.mocked(mockPrisma.account.findUnique).mockResolvedValue(null)

      const result = await adapter.getUserByAccount({
        provider: 'google',
        providerAccountId: '123',
      })

      expect(result).toBeNull()
    })

    it('returns null when account found but no user', async () => {
      vi.mocked(mockPrisma.account.findUnique).mockResolvedValue({
        user: null,
      } as any)

      const result = await adapter.getUserByAccount({
        provider: 'google',
        providerAccountId: '123',
      })

      expect(result).toBeNull()
    })
  })

  describe('updateUser', () => {
    it('updates user with new data', async () => {
      const mockUser = {
        id: 1,
        name: 'Jane Doe',
        email: 'jane@example.com',
        emailVerified: null,
        image: null,
      }

      vi.mocked(mockPrisma.user.update).mockResolvedValue(mockUser as any)

      const result = await adapter.updateUser({
        id: '1',
        name: 'Jane Doe',
        email: 'jane@example.com',
      })

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: 'Jane Doe',
          email: 'jane@example.com',
        },
      })

      expect(result).toEqual({
        id: '1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        emailVerified: null,
        image: null,
      })
    })

    it('handles null name by setting to empty string', async () => {
      const mockUser = {
        id: 1,
        name: '',
        email: 'john@example.com',
        emailVerified: null,
        image: null,
      }

      vi.mocked(mockPrisma.user.update).mockResolvedValue(mockUser as any)

      await adapter.updateUser({
        id: '1',
        name: null,
      })

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: '',
        },
      })
    })
  })

  describe('deleteUser', () => {
    it('deletes user and returns adapted user', async () => {
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        emailVerified: null,
        image: null,
      }

      vi.mocked(mockPrisma.user.delete).mockResolvedValue(mockUser as any)

      const result = await adapter.deleteUser('1')

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      })

      expect(result).toEqual({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        emailVerified: null,
        image: null,
      })
    })
  })

  describe('linkAccount', () => {
    it('creates account with all fields', async () => {
      const adapterAccount: AdapterAccount = {
        userId: '1',
        type: 'oauth',
        provider: 'google',
        providerAccountId: '123',
        access_token: 'access_token',
        expires_at: 1234567890,
        token_type: 'bearer',
        scope: 'read write',
        id_token: 'id_token',
        session_state: 'session_state',
        refresh_token: 'refresh_token',
      }

      const mockAccount = {
        id: 1,
        userId: 1,
        type: 'oauth',
        provider: 'google',
        providerAccountId: '123',
        access_token: 'access_token',
        expires_at: 1234567890,
        token_type: 'bearer',
        scope: 'read write',
        id_token: 'id_token',
        session_state: 'session_state',
        refresh_token: 'refresh_token',
      }

      vi.mocked(mockPrisma.account.create).mockResolvedValue(mockAccount as any)

      const result = await adapter.linkAccount(adapterAccount)

      expect(mockPrisma.account.create).toHaveBeenCalledWith({
        data: {
          provider: 'google',
          type: 'oauth',
          providerAccountId: '123',
          access_token: 'access_token',
          expires_at: 1234567890,
          token_type: 'bearer',
          scope: 'read write',
          id_token: 'id_token',
          session_state: 'session_state',
          refresh_token: 'refresh_token',
          user: {
            connect: { id: 1 },
          },
        },
      })

      expect(result).toEqual({
        userId: '1',
        type: 'oauth',
        provider: 'google',
        providerAccountId: '123',
        access_token: 'access_token',
        expires_at: 1234567890,
        token_type: 'bearer',
        scope: 'read write',
        id_token: 'id_token',
        session_state: 'session_state',
        refresh_token: 'refresh_token',
      })
    })

    it('handles null session_state', async () => {
      const adapterAccount: AdapterAccount = {
        userId: '1',
        type: 'oauth',
        provider: 'google',
        providerAccountId: '123',
        session_state: null,
      }

      const mockAccount = {
        id: 1,
        userId: 1,
        type: 'oauth',
        provider: 'google',
        providerAccountId: '123',
        session_state: null,
      }

      vi.mocked(mockPrisma.account.create).mockResolvedValue(mockAccount as any)

      await adapter.linkAccount(adapterAccount)

      expect(mockPrisma.account.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          session_state: undefined,
        }),
      })
    })

    it('handles undefined session_state', async () => {
      const adapterAccount: AdapterAccount = {
        userId: '1',
        type: 'oauth',
        provider: 'google',
        providerAccountId: '123',
      }

      const mockAccount = {
        id: 1,
        userId: 1,
        type: 'oauth',
        provider: 'google',
        providerAccountId: '123',
      }

      vi.mocked(mockPrisma.account.create).mockResolvedValue(mockAccount as any)

      await adapter.linkAccount(adapterAccount)

      expect(mockPrisma.account.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          session_state: undefined,
        }),
      })
    })

    it('converts session_state to string when not null/undefined', async () => {
      const adapterAccount: AdapterAccount = {
        userId: '1',
        type: 'oauth',
        provider: 'google',
        providerAccountId: '123',
        session_state: 12345 as any, // Non-string value
      }

      const mockAccount = {
        id: 1,
        userId: 1,
        type: 'oauth',
        provider: 'google',
        providerAccountId: '123',
        session_state: '12345',
      }

      vi.mocked(mockPrisma.account.create).mockResolvedValue(mockAccount as any)

      await adapter.linkAccount(adapterAccount)

      expect(mockPrisma.account.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          session_state: '12345',
        }),
      })
    })
  })

  describe('unlinkAccount', () => {
    it('deletes account and returns adapted account', async () => {
      const mockAccount = {
        id: 1,
        userId: 1,
        type: 'oauth',
        provider: 'google',
        providerAccountId: '123',
      }

      vi.mocked(mockPrisma.account.delete).mockResolvedValue(mockAccount as any)

      const result = await adapter.unlinkAccount({
        provider: 'google',
        providerAccountId: '123',
      })

      expect(mockPrisma.account.delete).toHaveBeenCalledWith({
        where: {
          provider_providerAccountId: {
            provider: 'google',
            providerAccountId: '123',
          },
        },
      })

      expect(result).toEqual({
        userId: '1',
        type: 'oauth',
        provider: 'google',
        providerAccountId: '123',
      })
    })
  })

  describe('updateSession', () => {
    it('updates session with new expiration', async () => {
      const expires = new Date('2024-12-31')
      const mockSession = {
        id: 1,
        sessionToken: 'session_token',
        userId: 1,
        expiresAt: expires,
        expires,
      }

      vi.mocked(mockPrisma.session.update).mockResolvedValue(mockSession as any)

      const result = await adapter.updateSession({
        sessionToken: 'session_token',
        expires,
        userId: '1',
      })

      expect(mockPrisma.session.update).toHaveBeenCalledWith({
        where: { sessionToken: 'session_token' },
        data: {
          expires,
          expiresAt: expires,
        },
      })

      expect(result).toEqual({
        sessionToken: 'session_token',
        userId: '1',
        expires,
      })
    })
  })

  describe('deleteSession', () => {
    it('deletes session', async () => {
      await adapter.deleteSession('session_token')

      expect(mockPrisma.session.delete).toHaveBeenCalledWith({
        where: { sessionToken: 'session_token' },
      })
    })
  })

  describe('createVerificationToken', () => {
    it('creates verification token', async () => {
      const token: VerificationToken = {
        identifier: 'test@example.com',
        token: 'token123',
        expires: new Date('2024-12-31'),
      }

      const mockToken = {
        identifier: 'test@example.com',
        token: 'token123',
        expires: new Date('2024-12-31'),
      }

      vi.mocked(mockPrisma.verificationToken.create).mockResolvedValue(
        mockToken as any,
      )

      const result = await adapter.createVerificationToken(token)

      expect(mockPrisma.verificationToken.create).toHaveBeenCalledWith({
        data: token,
      })

      expect(result).toEqual(mockToken)
    })
  })

  describe('useVerificationToken', () => {
    it('deletes verification token', async () => {
      const mockToken = {
        identifier: 'test@example.com',
        token: 'token123',
        expires: new Date('2024-12-31'),
      }

      vi.mocked(mockPrisma.verificationToken.delete).mockResolvedValue(
        mockToken as any,
      )

      const result = await adapter.useVerificationToken({
        identifier: 'test@example.com',
        token: 'token123',
      })

      expect(mockPrisma.verificationToken.delete).toHaveBeenCalledWith({
        where: {
          identifier_token: {
            identifier: 'test@example.com',
            token: 'token123',
          },
        },
      })

      expect(result).toEqual(mockToken)
    })
  })
})

import { render, screen } from '@testing-library/react'
import { PaymentTierEnum } from '@prisma/client'
import { redirect } from 'next/navigation'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getServerAuthSession } from '~/server/auth'
import { api } from '~/trpc/server'

// Mock server-only modules
vi.mock('server-only', () => ({}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

// Mock auth
vi.mock('~/server/auth', () => ({
  getServerAuthSession: vi.fn(),
}))

// Mock tRPC server
const mockVerifyEmail = vi.fn()
vi.mock('~/trpc/server', () => ({
  api: {
    auth: {
      verifyEmail: mockVerifyEmail,
    },
  },
}))

describe('VerifyEmailPage', () => {
  const mockUnverifiedSession = {
    user: {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      image: null,
      subscription: {
        tier: PaymentTierEnum.FREE,
        type: 'FREE',
      },
      emailVerified: null,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }

  const mockVerifiedSession = {
    user: {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      image: null,
      subscription: {
        tier: PaymentTierEnum.FREE,
        type: 'FREE',
      },
      emailVerified: new Date(),
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to login when user is not authenticated', async () => {
    vi.mocked(getServerAuthSession).mockResolvedValue(null)

    const { default: VerifyEmailPage } = await import('~/app/verify-email/page')

    try {
      await VerifyEmailPage({ searchParams: { token: 'test-token' } })
    } catch {
      // Expected - redirect throws
    }

    expect(redirect).toHaveBeenCalledWith('/login')
  })

  it('redirects to home when email is already verified', async () => {
    vi.mocked(getServerAuthSession).mockResolvedValue(mockVerifiedSession)

    const { default: VerifyEmailPage } = await import('~/app/verify-email/page')

    try {
      await VerifyEmailPage({ searchParams: { token: 'test-token' } })
    } catch {
      // Expected - redirect throws
    }

    expect(redirect).toHaveBeenCalledWith('/')
  })

  it('shows message when no token is provided', async () => {
    vi.mocked(getServerAuthSession).mockResolvedValue(mockUnverifiedSession)

    const { default: VerifyEmailPage } = await import('~/app/verify-email/page')
    const page = await VerifyEmailPage({ searchParams: {} })
    render(page)

    expect(screen.getByText('Email Verification')).toBeInTheDocument()
    expect(
      screen.getByText('Please check your email for the verification link.'),
    ).toBeInTheDocument()
  })

  it('verifies email and redirects on success', async () => {
    vi.mocked(getServerAuthSession).mockResolvedValue(mockUnverifiedSession)
    mockVerifyEmail.mockResolvedValue({ success: true })

    // Mock redirect to throw a redirect error
    const redirectError = {
      digest: 'NEXT_REDIRECT;/?verified=true',
      message: 'NEXT_REDIRECT',
    }
    vi.mocked(redirect).mockImplementation(() => {
      throw redirectError
    })

    const { default: VerifyEmailPage } = await import('~/app/verify-email/page')

    // The redirect error should be re-thrown by the page
    await expect(
      VerifyEmailPage({ searchParams: { token: 'valid-token' } }),
    ).rejects.toEqual(redirectError)

    expect(mockVerifyEmail).toHaveBeenCalledWith({ token: 'valid-token' })
    expect(redirect).toHaveBeenCalledWith('/?verified=true')
  })

  it('shows error message when token is invalid', async () => {
    vi.mocked(getServerAuthSession).mockResolvedValue(mockUnverifiedSession)
    const errorMessage = 'Invalid or expired verification token'
    mockVerifyEmail.mockRejectedValue(new Error(errorMessage))

    const { default: VerifyEmailPage } = await import('~/app/verify-email/page')
    const page = await VerifyEmailPage({
      searchParams: { token: 'invalid-token' },
    })
    render(page)

    expect(screen.getByText('Email Verification Failed')).toBeInTheDocument()
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
    expect(mockVerifyEmail).toHaveBeenCalledWith({ token: 'invalid-token' })
  })

  it('shows generic error message when error is not an Error instance', async () => {
    vi.mocked(getServerAuthSession).mockResolvedValue(mockUnverifiedSession)
    mockVerifyEmail.mockRejectedValue('String error')

    const { default: VerifyEmailPage } = await import('~/app/verify-email/page')
    const page = await VerifyEmailPage({
      searchParams: { token: 'invalid-token' },
    })
    render(page)

    expect(screen.getByText('Email Verification Failed')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Invalid or expired verification token. Please request a new verification email.',
      ),
    ).toBeInTheDocument()
  })

  it('re-throws redirect errors', async () => {
    vi.mocked(getServerAuthSession).mockResolvedValue(mockUnverifiedSession)
    mockVerifyEmail.mockResolvedValue({ success: true })

    // Create a mock redirect error
    const redirectError = {
      digest: 'NEXT_REDIRECT;/?verified=true',
      message: 'NEXT_REDIRECT',
    }

    // Mock redirect to throw the error
    vi.mocked(redirect).mockImplementation(() => {
      throw redirectError
    })

    const { default: VerifyEmailPage } = await import('~/app/verify-email/page')

    // The redirect error should be re-thrown, not caught
    await expect(
      VerifyEmailPage({ searchParams: { token: 'valid-token' } }),
    ).rejects.toEqual(redirectError)

    expect(mockVerifyEmail).toHaveBeenCalledWith({ token: 'valid-token' })
    expect(redirect).toHaveBeenCalledWith('/?verified=true')
  })
})

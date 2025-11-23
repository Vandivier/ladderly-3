import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { sendVerificationEmail } from '~/server/mailers/verifyEmailMailer'
import { getPostmarkClient } from '~/server/mailers/utils'

// Mock the postmark client
const mockSendEmail = vi.fn()
vi.mock('~/server/mailers/utils', () => ({
  getPostmarkClient: vi.fn(() => ({
    sendEmail: mockSendEmail,
  })),
}))

describe('sendVerificationEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.APP_ORIGIN = 'https://ladderly.io'
  })

  afterEach(() => {
    delete process.env.APP_ORIGIN
  })

  it('sends verification email with correct parameters', async () => {
    mockSendEmail.mockResolvedValue(undefined)

    await sendVerificationEmail({
      to: 'test@example.com',
      token: 'test-token-123',
    })

    expect(getPostmarkClient).toHaveBeenCalled()
    expect(mockSendEmail).toHaveBeenCalledWith({
      From: 'support@ladderly.io',
      To: 'test@example.com',
      Subject: 'Verify Your Email Address',
      HtmlBody: expect.stringContaining('Verify Your Email Address'),
    })

    const callArgs = mockSendEmail.mock.calls[0]?.[0]
    expect(callArgs?.HtmlBody).toContain(
      'https://ladderly.io/verify-email?token=test-token-123',
    )
  })

  it('uses localhost as default origin when APP_ORIGIN is not set', async () => {
    delete process.env.APP_ORIGIN
    mockSendEmail.mockResolvedValue(undefined)

    await sendVerificationEmail({
      to: 'test@example.com',
      token: 'test-token-123',
    })

    const callArgs = mockSendEmail.mock.calls[0]?.[0]
    expect(callArgs?.HtmlBody).toContain(
      'http://localhost:3000/verify-email?token=test-token-123',
    )
  })

  it('includes verification link in email body', async () => {
    mockSendEmail.mockResolvedValue(undefined)

    await sendVerificationEmail({
      to: 'test@example.com',
      token: 'test-token-123',
    })

    const callArgs = mockSendEmail.mock.calls[0]?.[0]
    expect(callArgs?.HtmlBody).toContain('Verify Email Address')
    expect(callArgs?.HtmlBody).toContain(
      'href="https://ladderly.io/verify-email?token=test-token-123"',
    )
  })

  it('includes safety message in email body', async () => {
    mockSendEmail.mockResolvedValue(undefined)

    await sendVerificationEmail({
      to: 'test@example.com',
      token: 'test-token-123',
    })

    const callArgs = mockSendEmail.mock.calls[0]?.[0]
    expect(callArgs?.HtmlBody).toContain(
      "If you didn't create an account with Ladderly.io, you can safely ignore this email.",
    )
  })

  it('throws error when email sending fails', async () => {
    const error = new Error('Postmark API error')
    mockSendEmail.mockRejectedValue(error)

    await expect(
      sendVerificationEmail({
        to: 'test@example.com',
        token: 'test-token-123',
      }),
    ).rejects.toThrow('Failed to send verification email')
  })
})

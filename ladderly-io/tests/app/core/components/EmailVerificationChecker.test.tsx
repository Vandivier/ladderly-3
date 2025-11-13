import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { EmailVerificationChecker } from '~/app/core/components/EmailVerificationChecker'

// Mock next-auth
const mockUseSession = vi.fn()
vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
}))

// Mock EmailVerificationModal
vi.mock('~/app/core/components/EmailVerificationModal', () => ({
  EmailVerificationModal: ({ email }: { email: string }) => (
    <div data-testid="email-verification-modal">Modal for {email}</div>
  ),
}))

describe('EmailVerificationChecker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not render modal when user is not authenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    })

    render(<EmailVerificationChecker />)

    expect(
      screen.queryByTestId('email-verification-modal'),
    ).not.toBeInTheDocument()
  })

  it('does not render modal when user email is verified', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          email: 'test@example.com',
          emailVerified: new Date(),
        },
      },
      status: 'authenticated',
    })

    render(<EmailVerificationChecker />)

    expect(
      screen.queryByTestId('email-verification-modal'),
    ).not.toBeInTheDocument()
  })

  it('renders modal when user is authenticated and email is not verified', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          email: 'test@example.com',
          emailVerified: null,
        },
      },
      status: 'authenticated',
    })

    render(<EmailVerificationChecker />)

    expect(screen.getByTestId('email-verification-modal')).toBeInTheDocument()
    expect(screen.getByText('Modal for test@example.com')).toBeInTheDocument()
  })

  it('does not render modal when user has no email', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          email: null,
          emailVerified: null,
        },
      },
      status: 'authenticated',
    })

    render(<EmailVerificationChecker />)

    expect(
      screen.queryByTestId('email-verification-modal'),
    ).not.toBeInTheDocument()
  })

  it('does not render modal when session is loading', () => {
    mockUseSession.mockReturnValue({
      data: undefined,
      status: 'loading',
    })

    render(<EmailVerificationChecker />)

    expect(
      screen.queryByTestId('email-verification-modal'),
    ).not.toBeInTheDocument()
  })
})

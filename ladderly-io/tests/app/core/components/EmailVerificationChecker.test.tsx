import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { EmailVerificationChecker } from '~/app/core/components/EmailVerificationChecker'

// Mock auth-client
const mockUseSession = vi.fn()
const mockSignOut = vi.fn()
vi.mock('~/server/auth-client', () => ({
  useSession: () => mockUseSession(),
  signOut: (...args: unknown[]) => mockSignOut(...args),
}))

// Mock EmailVerificationModal
vi.mock('~/app/core/components/EmailVerificationModal', () => ({
  EmailVerificationModal: ({
    email,
    onClose,
  }: {
    email: string
    onClose?: () => void
  }) => (
    <div data-testid="email-verification-modal">
      <div>Modal for {email}</div>
      {onClose && (
        <button data-testid="modal-close-button" onClick={onClose}>
          Close Modal
        </button>
      )}
    </div>
  ),
}))

describe('EmailVerificationChecker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSignOut.mockResolvedValue(undefined)
  })

  it('does not render modal when user is not authenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: false,
      error: null,
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
          emailVerified: true,
        },
        session: {
          expiresAt: new Date()
        }
      },
      isPending: false,
      error: null,
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
          emailVerified: false,
        },
        session: {
          expiresAt: new Date()
        }
      },
      isPending: false,
      error: null,
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
          emailVerified: false,
        },
        session: {
          expiresAt: new Date()
        }
      },
      isPending: false,
      error: null,
    })

    render(<EmailVerificationChecker />)

    expect(
      screen.queryByTestId('email-verification-modal'),
    ).not.toBeInTheDocument()
  })

  it('does not render modal when session is loading', () => {
    mockUseSession.mockReturnValue({
      data: undefined,
      isPending: true,
      error: null,
    })

    render(<EmailVerificationChecker />)

    expect(
      screen.queryByTestId('email-verification-modal'),
    ).not.toBeInTheDocument()
  })

  it('calls signOut when modal close button is clicked', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          email: 'test@example.com',
          emailVerified: false,
        },
        session: {
          expiresAt: new Date()
        }
      },
      isPending: false,
      error: null,
    })

    render(<EmailVerificationChecker />)

    const closeButton = screen.getByTestId('modal-close-button')
    fireEvent.click(closeButton)

    expect(mockSignOut).toHaveBeenCalledTimes(1)
    expect(mockSignOut).toHaveBeenCalledWith({
      fetchOptions: {
        onSuccess: expect.any(Function),
      },
    })
  })
})

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { EmailVerificationModal } from '~/app/core/components/EmailVerificationModal'

const mocks = vi.hoisted(() => {
  return {
    sendVerificationEmail: vi.fn(),
  }
})

// Mock auth-client
vi.mock('~/server/auth-client', () => ({
  authClient: {
    sendVerificationEmail: mocks.sendVerificationEmail,
  },
}))

describe('EmailVerificationModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock to return success by default
    mocks.sendVerificationEmail.mockResolvedValue({ data: { success: true }, error: null })
  })

  it('renders modal with email address', () => {
    render(<EmailVerificationModal email="test@example.com" />)

    expect(screen.getByText('Verify Your Email Address')).toBeInTheDocument()
    expect(
      screen.getByText(/Please verify your email address \(test@example.com\)/),
    ).toBeInTheDocument()
  })

  it('renders send verification email button', () => {
    render(<EmailVerificationModal email="test@example.com" />)

    expect(
      screen.getByRole('button', { name: 'Send Verification Email' }),
    ).toBeInTheDocument()
  })

  it('renders close button when onClose is provided', () => {
    const onClose = vi.fn()
    render(
      <EmailVerificationModal email="test@example.com" onClose={onClose} />,
    )

    // Check for the X button in header (has aria-label but no text)
    const xButton = screen.getByLabelText('Close')
    expect(xButton).toBeInTheDocument()

    // Check for the Close button at bottom (has text content)
    const closeButton = screen.getByText('Close')
    expect(closeButton).toBeInTheDocument()

    // Check for warning message about logout
    expect(
      screen.getByText(
        /Warning: If you close this modal without verifying your email, you will be logged out/i,
      ),
    ).toBeInTheDocument()
  })

  it('does not render close buttons when onClose is not provided', () => {
    render(<EmailVerificationModal email="test@example.com" />)

    expect(screen.queryByLabelText('Close')).not.toBeInTheDocument()
    expect(screen.queryByText('Close')).not.toBeInTheDocument()
  })

  it('calls onClose when X button is clicked', () => {
    const onClose = vi.fn()
    render(
      <EmailVerificationModal email="test@example.com" onClose={onClose} />,
    )

    const xButton = screen.getByLabelText('Close')
    fireEvent.click(xButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when bottom Close button is clicked', () => {
    const onClose = vi.fn()
    render(
      <EmailVerificationModal email="test@example.com" onClose={onClose} />,
    )

    // Use getByText to find the button with text content "Close"
    const closeButton = screen.getByText('Close')
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('sends verification email when button is clicked', async () => {
    mocks.sendVerificationEmail.mockResolvedValue({ data: { success: true }, error: null })

    render(<EmailVerificationModal email="test@example.com" />)

    const sendButton = screen.getByRole('button', {
      name: 'Send Verification Email',
    })

    await act(async () => {
      fireEvent.click(sendButton)
    })

    await waitFor(() => {
      expect(mocks.sendVerificationEmail).toHaveBeenCalledTimes(1)
      expect(mocks.sendVerificationEmail).toHaveBeenCalledWith({
        email: 'test@example.com',
        callbackURL: '/verify-email',
      })
    })
  })

  it('displays success message after sending email', async () => {
    mocks.sendVerificationEmail.mockResolvedValue({ data: { success: true }, error: null })

    render(<EmailVerificationModal email="test@example.com" />)

    const sendButton = screen.getByRole('button', {
      name: 'Send Verification Email',
    })

    await act(async () => {
      fireEvent.click(sendButton)
    })

    await waitFor(() => {
      expect(
        screen.getByText('Verification email sent! Please check your inbox.'),
      ).toBeInTheDocument()
    })
  })

  it('displays error message when sending fails', async () => {
    const errorMessage = 'Too many verification email requests'
    mocks.sendVerificationEmail.mockResolvedValue({ data: null, error: { message: errorMessage } })

    render(<EmailVerificationModal email="test@example.com" />)

    const sendButton = screen.getByRole('button', {
      name: 'Send Verification Email',
    })

    await act(async () => {
      fireEvent.click(sendButton)
    })

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('disables button while sending', async () => {
    let resolvePromise: (value: any) => void
    const promise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    mocks.sendVerificationEmail.mockReturnValue(promise)

    render(<EmailVerificationModal email="test@example.com" />)

    const sendButton = screen.getByRole('button', {
      name: 'Send Verification Email',
    })

    await act(async () => {
      fireEvent.click(sendButton)
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sending...' })).toBeDisabled()
    })

    await act(async () => {
      resolvePromise!({ data: { success: true }, error: null })
      await promise
    })
  })
})

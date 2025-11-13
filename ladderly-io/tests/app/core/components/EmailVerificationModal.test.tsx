import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { EmailVerificationModal } from '~/app/core/components/EmailVerificationModal'

// Mock tRPC - define mock functions before vi.mock (they get hoisted together)
const mockMutateAsync = vi.fn()

vi.mock('~/trpc/react', () => ({
  api: {
    auth: {
      sendVerificationEmail: {
        useMutation: vi.fn(
          (options?: {
            onSuccess?: () => void
            onError?: (error: Error) => void
          }) => {
            // Wrap mutateAsync to call callbacks
            const wrappedMutateAsync = vi.fn(async () => {
              try {
                const result = await mockMutateAsync()
                options?.onSuccess?.()
                return result
              } catch (error) {
                options?.onError?.(error as Error)
                throw error
              }
            })

            return {
              mutateAsync: wrappedMutateAsync,
            }
          },
        ),
      },
    },
  },
}))

describe('EmailVerificationModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock to return success by default
    mockMutateAsync.mockResolvedValue({ success: true })
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
    mockMutateAsync.mockResolvedValue({ success: true })

    render(<EmailVerificationModal email="test@example.com" />)

    const sendButton = screen.getByRole('button', {
      name: 'Send Verification Email',
    })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledTimes(1)
    })
  })

  it('displays success message after sending email', async () => {
    mockMutateAsync.mockResolvedValue({ success: true })

    render(<EmailVerificationModal email="test@example.com" />)

    const sendButton = screen.getByRole('button', {
      name: 'Send Verification Email',
    })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(
        screen.getByText('Verification email sent! Please check your inbox.'),
      ).toBeInTheDocument()
    })
  })

  it('displays error message when sending fails', async () => {
    const errorMessage = 'Too many verification email requests'
    const error = new Error(errorMessage)
    mockMutateAsync.mockRejectedValue(error)

    render(<EmailVerificationModal email="test@example.com" />)

    const sendButton = screen.getByRole('button', {
      name: 'Send Verification Email',
    })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })

  it('disables button while sending', async () => {
    let resolvePromise: () => void
    const promise = new Promise<{ success: boolean }>((resolve) => {
      resolvePromise = () => resolve({ success: true })
    })
    mockMutateAsync.mockReturnValue(promise)

    render(<EmailVerificationModal email="test@example.com" />)

    const sendButton = screen.getByRole('button', {
      name: 'Send Verification Email',
    })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sending...' })).toBeDisabled()
    })

    resolvePromise!()
    await promise
  })
})

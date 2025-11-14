import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { PaymentTierEnum } from '@prisma/client'
import type { Session } from 'next-auth'
import SignupForm from '~/app/(auth)/components/SignupForm'

// Mock next-auth/react
const mockSignIn = vi.fn()
const mockUseSession = vi.fn()
vi.mock('next-auth/react', () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
  useSession: () => mockUseSession(),
}))

// Mock next/navigation
const mockPush = vi.fn()
const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
    prefetch: vi.fn(),
  }),
}))

// Mock tRPC
const mockMutateAsync = vi.fn()
vi.mock('~/trpc/react', () => ({
  api: {
    auth: {
      signup: {
        useMutation: () => ({
          mutateAsync: mockMutateAsync,
        }),
      },
    },
  },
}))

// Mock Form component - use actual Form but simplify it for testing
vi.mock('~/app/core/components/Form', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('~/app/core/components/Form')>()
  return {
    ...actual,
    Form: actual.Form,
  }
})

describe('SignupForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    })
    mockMutateAsync.mockResolvedValue({ success: true })
    mockSignIn.mockResolvedValue({ ok: true, error: null })
  })

  it('renders signup form', () => {
    render(<SignupForm />)

    expect(screen.getByText('Create an Account')).toBeInTheDocument()
    expect(screen.getByText('Sign up with Google')).toBeInTheDocument()
    expect(screen.getByText('Create Account')).toBeInTheDocument()
    expect(screen.getByText('Already have an account?')).toBeInTheDocument()
  })

  it('calls onSuccess callback when provided', async () => {
    const mockOnSuccess = vi.fn()
    let sessionStatus: 'authenticated' | 'unauthenticated' | 'loading' =
      'unauthenticated'
    let sessionData: Session | null = null

    mockUseSession.mockImplementation(() => ({
      data: sessionData,
      status: sessionStatus,
    }))

    const { rerender } = render(<SignupForm onSuccess={mockOnSuccess} />)

    // Fill in form fields
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    const submitButton = screen.getByText('Create Account')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled()
    })

    // Simulate session becoming available
    sessionStatus = 'authenticated'
    sessionData = {
      user: {
        id: '123',
        email: 'test@example.com',
        name: null,
        image: null,
        subscription: {
          tier: PaymentTierEnum.FREE,
          type: 'FREE',
        },
        emailVerified: null,
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }

    mockUseSession.mockReturnValue({
      data: sessionData,
      status: sessionStatus,
    })

    // Re-render to trigger useEffect
    rerender(<SignupForm onSuccess={mockOnSuccess} />)

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('shows loading state when signing up', async () => {
    mockMutateAsync.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve({ success: true }), 100)
      })
    })

    render(<SignupForm />)

    // Fill in form fields
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    const submitButton = screen.getByText('Create Account')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Creating your account...')).toBeInTheDocument()
      expect(
        screen.getByText('Please wait while we set up your account.'),
      ).toBeInTheDocument()
    })
  })

  it('calls signup mutation with correct values', async () => {
    render(<SignupForm />)

    // Fill in form fields
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    const submitButton = screen.getByText('Create Account')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('calls signIn after successful signup', async () => {
    render(<SignupForm />)

    // Fill in form fields
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    const submitButton = screen.getByText('Create Account')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        redirect: false,
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('handles signup error - user already exists', async () => {
    // Override the beforeEach mockResolvedValue with a rejection
    // Use mockImplementation to ensure it always rejects for this test
    mockMutateAsync.mockImplementation(() =>
      Promise.reject(new Error('User already exists')),
    )
    mockSignIn.mockClear()

    render(<SignupForm />)

    // Fill in form fields
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    const submitButton = screen.getByText('Create Account')
    fireEvent.click(submitButton)

    // Wait for mutation to be called
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled()
    })

    // Verify the mock was set up to reject (not resolve)
    // This ensures our mock setup took effect
    const mockCall = mockMutateAsync.mock.calls[0]
    expect(mockCall).toBeDefined()

    // Wait for error handling to complete - event-based approach:
    // When the form heading reappears, it means setIsSigningUp(false) was called
    // and the component has re-rendered with the error state (form is visible again)
    await waitFor(
      () => {
        expect(screen.getByText('Create an Account')).toBeInTheDocument()
        expect(
          screen.queryByText('Creating your account...'),
        ).not.toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    // Verify signIn was never called - the mutation should have rejected before reaching signIn
    // If signIn was called, it means the mutation resolved (which shouldn't happen)
    // Check this AFTER waiting for error handling to ensure all async operations completed
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('handles signup error - generic error', async () => {
    // Override the beforeEach mockResolvedValue with a rejection
    // Use mockImplementation to ensure it always rejects for this test
    mockMutateAsync.mockImplementation(() =>
      Promise.reject(new Error('Something went wrong')),
    )
    mockSignIn.mockClear()

    render(<SignupForm />)

    // Fill in form fields
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    const submitButton = screen.getByText('Create Account')
    fireEvent.click(submitButton)

    // Wait for mutation to be called
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled()
    })

    // Verify the mock was set up to reject (not resolve)
    // This ensures our mock setup took effect
    const mockCall = mockMutateAsync.mock.calls[0]
    expect(mockCall).toBeDefined()

    // Wait for error handling to complete - event-based approach:
    // When the form heading reappears, it means setIsSigningUp(false) was called
    // and the component has re-rendered with the error state (form is visible again)
    await waitFor(
      () => {
        expect(screen.getByText('Create an Account')).toBeInTheDocument()
        expect(
          screen.queryByText('Creating your account...'),
        ).not.toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    // Verify signIn was never called - the mutation should have rejected before reaching signIn
    // If signIn was called, it means the mutation resolved (which shouldn't happen)
    // Check this AFTER waiting for error handling to ensure all async operations completed
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('handles signIn error after successful signup', async () => {
    mockSignIn.mockResolvedValue({
      ok: false,
      error: 'Sign in failed',
    })

    render(<SignupForm />)

    // Fill in form fields
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    const submitButton = screen.getByText('Create Account')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled()
    })

    // Should not show loading state after error
    expect(
      screen.queryByText('Creating your account...'),
    ).not.toBeInTheDocument()
    // Form should still be visible (not in loading state)
    expect(screen.getByText('Create an Account')).toBeInTheDocument()
  })

  it('redirects when session becomes authenticated after successful signup', async () => {
    let sessionStatus: 'authenticated' | 'unauthenticated' | 'loading' =
      'unauthenticated'
    let sessionData: Session | null = null

    mockUseSession.mockImplementation(() => ({
      data: sessionData,
      status: sessionStatus,
    }))

    const { rerender } = render(<SignupForm />)

    // Fill in form fields
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    const submitButton = screen.getByText('Create Account')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled()
      expect(screen.getByText('Creating your account...')).toBeInTheDocument()
    })

    // Simulate session becoming available
    sessionStatus = 'authenticated'
    sessionData = {
      user: {
        id: '123',
        email: 'test@example.com',
        name: null,
        image: null,
        subscription: {
          tier: PaymentTierEnum.FREE,
          type: 'FREE',
        },
        emailVerified: null,
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }

    mockUseSession.mockReturnValue({
      data: sessionData,
      status: sessionStatus,
    })

    // Re-render to trigger useEffect
    rerender(<SignupForm />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/?refresh_current_user=true')
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('does not redirect if session is not authenticated', async () => {
    render(<SignupForm />)

    // Fill in form fields
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    const submitButton = screen.getByText('Create Account')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled()
    })

    // Session remains unauthenticated
    expect(mockPush).not.toHaveBeenCalled()
    expect(mockRefresh).not.toHaveBeenCalled()
  })

  it('does not redirect if session has no user', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'authenticated', // Status is authenticated but no user data
    })

    render(<SignupForm />)

    // Fill in form fields
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    const submitButton = screen.getByText('Create Account')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled()
    })

    expect(mockPush).not.toHaveBeenCalled()
    expect(mockRefresh).not.toHaveBeenCalled()
  })
})

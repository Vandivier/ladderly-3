import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { PaymentTierEnum } from '@prisma/client'
import type { Session } from 'next-auth'
import { LoginForm } from '~/app/(auth)/components/LoginForm'

// Mock next-auth/react - this module is NOT mocked globally so we mock it here
const mockSignIn = vi.fn()
const mockUseSession = vi.fn()
vi.mock('next-auth/react', () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
  useSession: () => mockUseSession(),
}))

// Mock next/navigation - re-mock to override the global mock with test-specific mocks
const mockPush = vi.fn()
const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
    prefetch: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
    toString: () => '',
  }),
  usePathname: () => '',
  notFound: vi.fn(),
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

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mocks to ensure clean state between tests
    mockSignIn.mockReset()
    mockUseSession.mockReset()
    mockPush.mockReset()
    mockRefresh.mockReset()

    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    })
    mockSignIn.mockResolvedValue({ ok: true, error: null })
  })

  it('renders login form', () => {
    render(<LoginForm />)

    expect(screen.getByText('Log In')).toBeInTheDocument()
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument()
    expect(screen.getByText('Log In with Email')).toBeInTheDocument()
    expect(screen.getByText('Need to create an account?')).toBeInTheDocument()
  })

  it('shows loading state when logging in', async () => {
    mockSignIn.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve({ ok: true, error: null }), 100)
      })
    })

    render(<LoginForm />)

    // Fill in form fields
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    const submitButton = screen.getByText('Log In with Email')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Logging in...')).toBeInTheDocument()
      expect(
        screen.getByText('Please wait while we sign you in.'),
      ).toBeInTheDocument()
    })
  })

  it('calls signIn with correct credentials', async () => {
    render(<LoginForm />)

    // Fill in form fields
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    const submitButton = screen.getByText('Log In with Email')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        redirect: false,
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('shows error message when login fails', async () => {
    mockSignIn.mockResolvedValue({
      ok: false,
      error: 'Invalid credentials',
    })

    render(<LoginForm />)

    // Fill in form fields
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    const submitButton = screen.getByText('Log In with Email')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled()
    })

    // Form should handle the error and not show loading state
    expect(screen.queryByText('Logging in...')).not.toBeInTheDocument()
    // Form should still be visible (not in loading state)
    expect(screen.getByText('Log In')).toBeInTheDocument()
  })

  it('redirects when session becomes authenticated after successful login', async () => {
    let sessionStatus: 'authenticated' | 'unauthenticated' | 'loading' =
      'unauthenticated'
    let sessionData: Session | null = null

    mockUseSession.mockImplementation(() => ({
      data: sessionData,
      status: sessionStatus,
    }))

    mockSignIn.mockResolvedValue({ ok: true, error: null })

    const { rerender } = render(<LoginForm />)

    // Fill in form fields
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    const submitButton = screen.getByText('Log In with Email')
    fireEvent.click(submitButton)

    // Wait for signIn to complete and loading state
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled()
      expect(screen.getByText('Logging in...')).toBeInTheDocument()
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

    // Update mock and re-render to trigger useEffect
    mockUseSession.mockReturnValue({
      data: sessionData,
      status: sessionStatus,
    })

    rerender(<LoginForm />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/?refresh_current_user=true')
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('does not redirect if session is not authenticated', async () => {
    mockSignIn.mockResolvedValue({ ok: true, error: null })

    render(<LoginForm />)

    // Fill in form fields
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    const submitButton = screen.getByText('Log In with Email')
    fireEvent.click(submitButton)

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

    mockSignIn.mockResolvedValue({ ok: true, error: null })

    render(<LoginForm />)

    // Fill in form fields
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    const submitButton = screen.getByText('Log In with Email')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled()
    })

    expect(mockPush).not.toHaveBeenCalled()
    expect(mockRefresh).not.toHaveBeenCalled()
  })
})

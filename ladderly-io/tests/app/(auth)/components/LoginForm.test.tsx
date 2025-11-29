import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}))

// Mock auth-client - using hoisted mock functions
const mockSignInEmail = vi.fn()
const mockSignInSocial = vi.fn()
const mockSessionData = { current: null as { user: unknown } | null }

vi.mock('~/server/auth-client', () => ({
  signIn: {
    email: (...args: unknown[]) => mockSignInEmail(...args),
    social: (...args: unknown[]) => mockSignInSocial(...args),
  },
  useSession: () => ({ data: mockSessionData.current }),
}))

// Import after mocks are set up
import { LoginForm } from '~/app/(auth)/components/LoginForm'

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSessionData.current = null
  })

  it('renders login form with email and password fields', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /log in with email/i }),
    ).toBeInTheDocument()
  })

  it('renders Google sign-in button', () => {
    render(<LoginForm />)

    expect(
      screen.getByRole('button', { name: /sign in with google/i }),
    ).toBeInTheDocument()
  })

  it('renders Reset Your Password link', () => {
    render(<LoginForm />)

    expect(
      screen.getByRole('link', { name: /reset your password/i }),
    ).toHaveAttribute('href', '/forgot-password')
  })

  it('shows reset suggestion when login fails with password error', async () => {
    mockSignInEmail.mockResolvedValue({
      data: null,
      error: { message: 'Invalid password' },
    })

    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', {
      name: /log in with email/i,
    })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/having trouble logging in/i)).toBeInTheDocument()
    })

    expect(
      screen.getByRole('link', { name: /reset password now/i }),
    ).toBeInTheDocument()
  })

  it('shows reset suggestion when login fails with invalid credentials', async () => {
    mockSignInEmail.mockResolvedValue({
      data: null,
      error: { message: 'Invalid credentials' },
    })

    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', {
      name: /log in with email/i,
    })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/having trouble logging in/i)).toBeInTheDocument()
    })
  })

  it('does not show reset suggestion for non-password errors', async () => {
    mockSignInEmail.mockResolvedValue({
      data: null,
      error: { message: 'Rate limit exceeded' },
    })

    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', {
      name: /log in with email/i,
    })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'somepassword' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSignInEmail).toHaveBeenCalled()
    })

    expect(
      screen.queryByText(/having trouble logging in/i),
    ).not.toBeInTheDocument()
  })

  it('shows loading state while logging in', async () => {
    mockSignInEmail.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: {}, error: null }), 100),
        ),
    )

    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', {
      name: /log in with email/i,
    })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/logging in/i)).toBeInTheDocument()
    })
  })
})

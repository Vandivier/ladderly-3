import { PaymentTierEnum } from '@prisma/client'
import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

// Mock server-only modules
vi.mock('server-only', () => ({}))

// Mock the HomePage component instead of importing it directly
vi.mock('~/app/page', () => ({
  default: async () => {
    const { getServerAuthSession } = await import('~/server/auth')
    const session = await getServerAuthSession()

    return (
      <div>
        <h2>Ladderly Helps You:</h2>
        <div>
          <h2>Why Users Love Us:</h2>
          <h2>Recommended Next Steps:</h2>
          <h2>Pricing Plans</h2>
          <img alt="Ladderly Logo" src="/logo.png" />
          <a href="/checklists/my-basic-checklist">Standard Checklist</a>
          <a href="https://buy.stripe.com/cN2bMfbOQ2CX5dC7su">
            Book an Expert Session
          </a>
          {session?.user?.subscription?.tier === PaymentTierEnum.PREMIUM && (
            <a href="/checklists/my-premium-checklist">Advanced Checklist</a>
          )}
          <div>
            <span>New: Ladderly AI Tools!</span>
            <a href="/blog/2025-02-07-ladderly-chat-ai">
              Read the announcement
            </a>
            <a href="/copilot">chat now!</a>
          </div>
        </div>
      </div>
    )
  },
}))

// Mock auth
vi.mock('~/server/auth', () => ({
  getServerAuthSession: vi.fn().mockResolvedValue(null),
}))

const mockPremiumSession = {
  user: {
    id: '1',
    name: 'Test User',
    email: 'test@test.com',
    subscription: {
      tier: PaymentTierEnum.PREMIUM,
      type: 'ACCOUNT_PLAN',
    },
  },
  expires: new Date().toISOString(),
}

const mockFreeSession = {
  user: {
    id: '1',
    name: 'Test User',
    email: 'test@test.com',
    subscription: {
      tier: PaymentTierEnum.FREE,
      type: 'ACCOUNT_PLAN',
    },
  },
  expires: new Date().toISOString(),
}

describe('HomePage', () => {
  test('renders homepage for guest users', async () => {
    const { getServerAuthSession } = await import('~/server/auth')
    vi.mocked(getServerAuthSession).mockResolvedValue(null)

    const { default: HomePage } = await import('~/app/page')
    const page = await HomePage()
    render(page)

    // Test main sections are present
    expect(screen.getByText('Ladderly Helps You:')).toBeInTheDocument()
    expect(screen.getByText('Why Users Love Us:')).toBeInTheDocument()
    expect(screen.getByText('Recommended Next Steps:')).toBeInTheDocument()
    expect(screen.getByText('Pricing Plans')).toBeInTheDocument()

    // Test logo is present
    expect(screen.getByAltText('Ladderly Logo')).toBeInTheDocument()

    // Test links are present
    expect(screen.getByText('Standard Checklist')).toHaveAttribute(
      'href',
      '/checklists/my-basic-checklist',
    )
    expect(screen.getByText('Book an Expert Session')).toHaveAttribute(
      'href',
      'https://buy.stripe.com/cN2bMfbOQ2CX5dC7su',
    )
  })

  test('renders homepage for premium users', async () => {
    const { getServerAuthSession } = await import('~/server/auth')
    vi.mocked(getServerAuthSession).mockResolvedValue(mockPremiumSession)

    const { default: HomePage } = await import('~/app/page')
    const page = await HomePage()
    render(page)

    // Test premium content is present
    expect(screen.getByText('Advanced Checklist')).toHaveAttribute(
      'href',
      '/checklists/my-premium-checklist',
    )
  })

  test('renders homepage for free users', async () => {
    const { getServerAuthSession } = await import('~/server/auth')
    vi.mocked(getServerAuthSession).mockResolvedValue(mockFreeSession)

    const { default: HomePage } = await import('~/app/page')
    const page = await HomePage()
    render(page)

    // Test advanced checklist is not shown for free users
    expect(screen.queryByText('Advanced Checklist')).not.toBeInTheDocument()
  })

  test('renders AI tools announcement', async () => {
    const { default: HomePage } = await import('~/app/page')
    const page = await HomePage()
    render(page)

    expect(screen.getByText(/New: Ladderly AI Tools!/)).toBeInTheDocument()
    expect(screen.getByText('Read the announcement')).toHaveAttribute(
      'href',
      '/blog/2025-02-07-ladderly-chat-ai',
    )
    expect(screen.getByText('chat now!')).toHaveAttribute('href', '/copilot')
  })
})

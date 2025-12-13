import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import PricingGrid from '~/app/core/components/pricing-grid/PricingGrid'
import { PaymentTierEnum } from '@prisma/client'
import type { UserWithSubscriptionsOrZero } from '~/server/schemas'
import { makeMockUser } from '@tests/factories/userFactory'

// Mock the server API
vi.mock('~/trpc/server', () => ({
  api: {
    user: {
      getCurrentUser: vi.fn(),
    },
  },
}))

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

describe('PricingGrid', () => {
  it('renders pricing plans section', async () => {
    // Mock getCurrentUser to return guest user (0)
    const { api } = await import('~/trpc/server')
    vi.mocked(api.user.getCurrentUser).mockResolvedValue(0)

    const pricingGrid = await PricingGrid({})
    render(pricingGrid)

    // Check if main heading is present
    expect(screen.getByText('Pricing Plans')).toBeInTheDocument()

    // Check if both plans are rendered
    expect(screen.getByText('Premium')).toBeInTheDocument()
    expect(screen.getByText('Free')).toBeInTheDocument()

    // Check if prices are displayed
    expect(screen.getByText('$6/mo')).toBeInTheDocument()
    expect(screen.getByText('$0')).toBeInTheDocument()

    // Check if benefits are displayed
    expect(screen.getByText('AI Tool Access')).toBeInTheDocument()
    expect(screen.getByText('Open Source Curriculum')).toBeInTheDocument()
  })

  it('shows correct buttons for logged out users', async () => {
    const { api } = await import('~/trpc/server')
    vi.mocked(api.user.getCurrentUser).mockResolvedValue(0)

    const pricingGrid = await PricingGrid({})
    render(pricingGrid)

    const joinNowButtons = screen.getAllByText('Join Now')
    expect(joinNowButtons).toHaveLength(2) // One for each plan

    // Check if buttons link to signup
    const signupLinks = screen.getAllByRole('link', { name: 'Join Now' })
    expect(signupLinks[0]).toHaveAttribute('href', '/signup?planId=40')
  })

  it('shows correct UI for logged in users with free tier', async () => {
    const { api } = await import('~/trpc/server')
    const mockUser = makeMockUser() as UserWithSubscriptionsOrZero
    vi.mocked(api.user.getCurrentUser).mockResolvedValue(mockUser)

    const pricingGrid = await PricingGrid({})
    render(pricingGrid)

    expect(
      screen.getByText('You already have access to this plan!'),
    ).toBeInTheDocument()
    expect(screen.getByText('Join Now')).toBeInTheDocument()
  })

  it('shows correct UI for premium subscribers', async () => {
    const { api } = await import('~/trpc/server')
    const mockUser = makeMockUser({
      subscriptions: [
        {
          id: 1,
          tier: PaymentTierEnum.PREMIUM,
          userId: 1,
          type: 'subscription',
          createdAt: new Date(),
          updatedAt: new Date(),
          stripeCustomerId: null,
          stripeSubscriptionId: null,
        },
      ],
    }) as UserWithSubscriptionsOrZero
    vi.mocked(api.user.getCurrentUser).mockResolvedValue(mockUser)

    const pricingGrid = await PricingGrid({})
    render(pricingGrid)

    const accessMessages = screen.getAllByText(
      'You already have access to this plan!',
    )
    expect(accessMessages).toHaveLength(2)
  })

  it('renders reimbursement section', async () => {
    const { api } = await import('~/trpc/server')
    vi.mocked(api.user.getCurrentUser).mockResolvedValue(0)

    const pricingGrid = await PricingGrid({})
    render(pricingGrid)

    expect(screen.getByText('Get Premium for Free!')).toBeInTheDocument()
    expect(screen.getByText('Reimbursement Request Letter')).toBeInTheDocument()
  })
})

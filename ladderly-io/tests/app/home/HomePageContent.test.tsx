import { PaymentTierEnum } from '@prisma/client'
import { render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import HomePageContent from '~/app/home/HomePageContent'
import type { LadderlyServerSession } from '~/server/better-auth'

// Mock PricingGrid component
vi.mock('~/app/core/components/pricing-grid/PricingGrid', () => ({
  default: () => <div>Pricing Plans</div>,
}))

// Mock LadderlyPageWrapper component
vi.mock('~/app/core/components/page-wrapper/LadderlyPageWrapper', () => ({
  LadderlyPageWrapper: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

// Mock other components that might access server-side resources
vi.mock('~/app/home/LadderlyHelpsBlock', () => ({
  LadderlyHelpsBlock: () => <div>Ladderly Helps You:</div>,
}))

vi.mock('~/app/home/TestimonialBlock', () => ({
  TestimonialBlock: () => <div>User Testimonials</div>,
}))

describe('HomePageContent', () => {
  test('renders homepage for guest users', () => {
    render(<HomePageContent session={null} />)

    // Test main sections are present
    expect(screen.getByText('Ladderly Helps You:')).toBeInTheDocument()
    expect(screen.getByText('Why Users Love Us:')).toBeInTheDocument()
    expect(screen.getByText('Recommended Next Steps:')).toBeInTheDocument()
    expect(screen.getByText('Pricing Plans')).toBeInTheDocument()

    // Test logo is present (using getAllByAltText since there are two logo images for different screen sizes)
    const logoImages = screen.getAllByAltText('Ladderly Logo')
    expect(logoImages.length).toBe(1)

    // Test links are present
    expect(screen.getByText('Standard Checklist')).toHaveAttribute(
      'href',
      '/checklists/my-basic-checklist',
    )
  })

  test('renders homepage for premium users', () => {
    const premiumSession: LadderlyServerSession = {
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@test.com',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        subscription: {
          tier: PaymentTierEnum.PREMIUM,
          type: 'ACCOUNT_PLAN',
        },
      },
      session: {
        id: 'session-1',
        userId: '1',
        expiresAt: new Date(),
        token: 'token-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      },
    }

    render(<HomePageContent session={premiumSession} />)

    // Test premium content is present
    expect(screen.getByText('Advanced Checklist')).toHaveAttribute(
      'href',
      '/checklists/my-premium-checklist',
    )
  })

  test('renders homepage for free users', () => {
    const freeSession: LadderlyServerSession = {
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@test.com',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        subscription: {
          tier: PaymentTierEnum.FREE,
          type: 'ACCOUNT_PLAN',
        },
      },
      session: {
        id: 'session-1',
        userId: '1',
        expiresAt: new Date(),
        token: 'token-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      },
    }

    render(<HomePageContent session={freeSession} />)

    // Test advanced checklist is not shown for free users
    expect(screen.queryByText('Advanced Checklist')).not.toBeInTheDocument()
  })
})

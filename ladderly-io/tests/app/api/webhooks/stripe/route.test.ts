import { PaymentTierEnum } from '@prisma/client'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { POST } from '~/app/api/webhooks/stripe/route'
import { db } from '~/server/db'

// Mock dependencies
vi.mock('next/headers', () => ({
  headers: vi.fn(() => ({
    get: vi.fn().mockReturnValue('mock-signature'),
  })),
}))

vi.mock('stripe', () => {
  const constructEventAsync = vi.fn()
  return {
    default: class MockStripe {
      constructor(_key: string, _config: { apiVersion: string }) {}
      webhooks = {
        constructEventAsync,
      }
    },
  }
})

vi.mock('~/server/db', () => ({
  db: {
    subscription: {
      update: vi.fn(),
    },
  },
}))

describe('Stripe webhook handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('handles checkout.session.completed event', async () => {
    const mockEvent = {
      id: 'evt_123',
      object: 'event',
      api_version: '2023-10-16',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: 'cs_123',
          object: 'checkout.session',
          client_reference_id: '123',
          customer: 'cus_123',
          subscription: 'sub_123',
        },
      },
      livemode: false,
      pending_webhooks: 0,
      request: { id: 'req_123', idempotency_key: 'idk_123' },
      type: 'checkout.session.completed',
    } as unknown as Stripe.Event

    // Mock Stripe event construction
    const { default: StripeConstructor } = await import('stripe')
    const mockStripeInstance = new StripeConstructor('mock_key', {
      apiVersion: '2023-10-16',
    })
    vi.mocked(
      mockStripeInstance.webhooks.constructEventAsync,
    ).mockResolvedValueOnce(mockEvent)

    // Mock database update
    vi.mocked(db.subscription.update).mockResolvedValue({
      id: 1,
      userId: 123,
      type: 'ACCOUNT_PLAN',
      tier: PaymentTierEnum.PREMIUM,
      stripeCustomerId: 'cus_123',
      stripeSubscriptionId: 'sub_123',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const response = await POST(
      new Request('http://localhost', {
        method: 'POST',
        body: 'mock-body',
      }),
    )

    // Verify response
    expect(response).toBeInstanceOf(NextResponse)
    expect(await response.json()).toEqual({ received: true })

    // Verify database was updated correctly
    expect(db.subscription.update).toHaveBeenCalledWith({
      where: {
        userId_type: {
          userId: 123,
          type: 'ACCOUNT_PLAN',
        },
      },
      data: {
        tier: PaymentTierEnum.PREMIUM,
        stripeCustomerId: 'cus_123',
        stripeSubscriptionId: 'sub_123',
      },
    })
  })

  test('handles customer.subscription.deleted event', async () => {
    const mockEvent = {
      id: 'evt_123',
      object: 'event',
      api_version: '2023-10-16',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: 'sub_123',
          object: 'subscription',
          metadata: {
            userId: '123',
          },
        },
      },
      livemode: false,
      pending_webhooks: 0,
      request: { id: 'req_123', idempotency_key: 'idk_123' },
      type: 'customer.subscription.deleted',
    } as unknown as Stripe.Event

    // Mock Stripe event construction
    const { default: StripeConstructor } = await import('stripe')
    const mockStripeInstance = new StripeConstructor('mock_key', {
      apiVersion: '2023-10-16',
    })
    vi.mocked(
      mockStripeInstance.webhooks.constructEventAsync,
    ).mockResolvedValueOnce(mockEvent)

    // Mock database update
    vi.mocked(db.subscription.update).mockResolvedValue({
      id: 1,
      userId: 123,
      type: 'ACCOUNT_PLAN',
      tier: PaymentTierEnum.FREE,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const response = await POST(
      new Request('http://localhost', {
        method: 'POST',
        body: 'mock-body',
      }),
    )

    // Verify response
    expect(response).toBeInstanceOf(NextResponse)
    expect(await response.json()).toEqual({ received: true })

    // Verify database was updated correctly
    expect(db.subscription.update).toHaveBeenCalledWith({
      where: {
        userId_type: {
          userId: 123,
          type: 'ACCOUNT_PLAN',
        },
      },
      data: {
        tier: PaymentTierEnum.FREE,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
      },
    })
  })

  test('handles Stripe signature verification failure', async () => {
    // Mock Stripe event construction to throw
    const { default: StripeConstructor } = await import('stripe')
    const mockStripeInstance = new StripeConstructor('mock_key', {
      apiVersion: '2023-10-16',
    })
    vi.mocked(
      mockStripeInstance.webhooks.constructEventAsync,
    ).mockRejectedValueOnce(new Error('Invalid signature'))

    const response = await POST(
      new Request('http://localhost', {
        method: 'POST',
        body: 'mock-body',
      }),
    )

    // Verify error response
    expect(response).toBeInstanceOf(NextResponse)
    expect(await response.json()).toEqual({ error: 'Webhook handler failed' })
    expect(response.status).toBe(400)
  })

  test('handles missing user ID in checkout session', async () => {
    const mockEvent = {
      id: 'evt_123',
      object: 'event',
      api_version: '2023-10-16',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: 'cs_123',
          object: 'checkout.session',
          client_reference_id: null, // Missing user ID
          customer: 'cus_123',
          subscription: 'sub_123',
        },
      },
      livemode: false,
      pending_webhooks: 0,
      request: { id: 'req_123', idempotency_key: 'idk_123' },
      type: 'checkout.session.completed',
    } as unknown as Stripe.Event

    // Mock Stripe event construction
    const { default: StripeConstructor } = await import('stripe')
    const mockStripeInstance = new StripeConstructor('mock_key', {
      apiVersion: '2023-10-16',
    })
    vi.mocked(
      mockStripeInstance.webhooks.constructEventAsync,
    ).mockResolvedValueOnce(mockEvent)

    const response = await POST(
      new Request('http://localhost', {
        method: 'POST',
        body: 'mock-body',
      }),
    )

    // Verify error response
    expect(response).toBeInstanceOf(NextResponse)
    expect(await response.json()).toEqual({ error: 'Webhook handler failed' })
    expect(response.status).toBe(400)
  })

  test('handles unhandled event types', async () => {
    const mockEvent = {
      id: 'evt_123',
      object: 'event',
      api_version: '2023-10-16',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: 'obj_123',
          object: 'unknown',
        },
      },
      livemode: false,
      pending_webhooks: 0,
      request: { id: 'req_123', idempotency_key: 'idk_123' },
      type: 'unknown.event',
    } as unknown as Stripe.Event

    // Mock Stripe event construction
    const { default: StripeConstructor } = await import('stripe')
    const mockStripeInstance = new StripeConstructor('mock_key', {
      apiVersion: '2023-10-16',
    })
    vi.mocked(
      mockStripeInstance.webhooks.constructEventAsync,
    ).mockResolvedValueOnce(mockEvent)

    const response = await POST(
      new Request('http://localhost', {
        method: 'POST',
        body: 'mock-body',
      }),
    )

    // Verify response
    expect(response).toBeInstanceOf(NextResponse)
    expect(await response.json()).toEqual({ received: true })
  })
})

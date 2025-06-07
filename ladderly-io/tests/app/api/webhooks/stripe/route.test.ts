import { PaymentTierEnum } from '@prisma/client'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { POST } from '~/app/api/webhooks/stripe/route'
import { db } from '~/server/db'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

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
  const consoleSpy = vi.spyOn(console, 'log')
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    consoleSpy.mockClear()
    // Reset process.env to its original state before each test
    process.env = { ...originalEnv }
  })

  test('returns 501 error if Stripe is not configured', async () => {
    // Ensure environment variables are not set for this test
    delete process.env.STRIPE_SECRET_KEY
    delete process.env.STRIPE_WEBHOOK_SECRET

    const response = await POST(
      new Request('http://localhost', {
        method: 'POST',
        body: 'mock-body',
      }),
    )

    expect(response).toBeInstanceOf(NextResponse)
    expect(response.status).toBe(501)
    expect(await response.json()).toEqual({
      error: 'Stripe integration is not configured',
    })
  })

  describe('when Stripe is configured', () => {
    beforeEach(() => {
      // Set environment variables for all tests in this describe block
      process.env.STRIPE_SECRET_KEY = 'mock-secret-key'
      process.env.STRIPE_WEBHOOK_SECRET = 'mock-webhook-secret'
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

      // Verify logging
      expect(consoleSpy).toHaveBeenCalledWith(
        'Successfully upgraded subscription for user 123 to PREMIUM',
      )
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

      // Verify logging
      expect(consoleSpy).toHaveBeenCalledWith(
        'Successfully downgraded subscription for user 123 to FREE',
      )
    })

    test('handles idempotent subscription deletion when subscription not found', async () => {
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

      // Mock database update to throw P2025 error
      vi.mocked(db.subscription.update).mockRejectedValue(
        new PrismaClientKnownRequestError('Record not found', {
          code: 'P2025',
          clientVersion: '5.0.0',
        }),
      )

      const response = await POST(
        new Request('http://localhost', {
          method: 'POST',
          body: 'mock-body',
        }),
      )

      // Verify response is still successful
      expect(response).toBeInstanceOf(NextResponse)
      expect(await response.json()).toEqual({ received: true })

      // Verify logging
      expect(consoleSpy).toHaveBeenCalledWith(
        'Attempted to delete a subscription that was not found. User ID: 123, Subscription ID: sub_123',
      )
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

      // Verify logging
      expect(consoleSpy).toHaveBeenCalledWith(
        'Unhandled event type: unknown.event',
      )
    })

    test('handles subscription deletion with missing user ID', async () => {
      const mockEvent = {
        id: 'evt_123',
        object: 'event',
        api_version: '2023-10-16',
        created: Math.floor(Date.now() / 1000),
        data: {
          object: {
            id: 'sub_123',
            object: 'subscription',
            metadata: {}, // No userId in metadata
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

      const response = await POST(
        new Request('http://localhost', {
          method: 'POST',
          body: 'mock-body',
        }),
      )

      // Verify response is successful
      expect(response).toBeInstanceOf(NextResponse)
      expect(await response.json()).toEqual({ received: true })

      // Verify logging
      expect(consoleSpy).toHaveBeenCalledWith(
        'No user ID found in subscription metadata for subscription: sub_123',
      )

      // Verify database was not called
      expect(db.subscription.update).not.toHaveBeenCalled()
    })
  })
})

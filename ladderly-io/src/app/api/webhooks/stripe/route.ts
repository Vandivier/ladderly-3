import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '~/server/db'
import { PaymentTierEnum } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

export async function POST(req: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  // Check if Stripe is configured and if not return an error
  if (!stripeSecretKey || !webhookSecret) {
    console.warn('Stripe webhook endpoint called but Stripe is not configured')
    return NextResponse.json(
      { error: 'Stripe integration is not configured' },
      { status: 501 }, // 501 Not Implemented
    )
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' })

  const body = await req.text()
  const signature = String(headers().get('stripe-signature')!)

  try {
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
    )

    switch (event.type) {
      case 'checkout.session.completed': {
        const session: Stripe.Checkout.Session = event.data.object
        const userId = session.client_reference_id

        if (!userId) {
          throw new Error('No user ID found in session')
        }

        // Update existing subscription
        const subscription = await db.subscription.update({
          where: {
            userId_type: {
              userId: parseInt(userId),
              type: 'ACCOUNT_PLAN',
            },
          },
          data: {
            tier: PaymentTierEnum.PREMIUM,
            stripeCustomerId: String(session.customer),
            stripeSubscriptionId: String(session.subscription),
          },
        })

        if (!subscription) {
          throw new Error(`No subscription found for user ID: ${userId}`)
        }

        console.log(
          `Successfully upgraded subscription for user ${userId} to PREMIUM`,
        )
        break
      }

      case 'customer.subscription.deleted': {
        const subscription: Stripe.Subscription = event.data.object
        const userId = subscription.metadata?.userId
        const subscriptionId = subscription.id

        if (!userId) {
          console.log(
            `No user ID found in subscription metadata for subscription: ${subscriptionId}`,
          )
          return NextResponse.json({ received: true })
        }

        try {
          // Update existing subscription back to FREE
          await db.subscription.update({
            where: {
              userId_type: {
                userId: parseInt(userId),
                type: 'ACCOUNT_PLAN',
              },
            },
            data: {
              tier: PaymentTierEnum.FREE,
              stripeCustomerId: null,
              stripeSubscriptionId: null,
            },
          })

          console.log(
            `Successfully downgraded subscription for user ${userId} to FREE`,
          )
        } catch (error) {
          if (
            error instanceof PrismaClientKnownRequestError &&
            error.code === 'P2025'
          ) {
            console.log(
              `Attempted to delete a subscription that was not found. User ID: ${userId}, Subscription ID: ${subscriptionId}`,
            )
            return NextResponse.json({ received: true })
          }
          throw error
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 },
    )
  }
}

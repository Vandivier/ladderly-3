import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '~/server/db'
import { PaymentTierEnum } from '@prisma/client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')!

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

        // Find user by ID
        const user = await db.user.findUnique({
          where: { id: parseInt(userId) },
        })

        if (!user) {
          throw new Error('No user found with ID: ' + userId)
        }

        // Create subscription
        await db.subscription.create({
          data: {
            userId: user.id,
            tier: PaymentTierEnum.PREMIUM,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          },
        })
        break
      }

      case 'customer.subscription.deleted': {
        const subscription: Stripe.Subscription = event.data.object
        const userId = subscription.metadata?.userId

        if (!userId) {
          throw new Error('No user ID found in subscription metadata')
        }

        // Update the subscription to FREE tier
        await db.subscription.updateMany({
          where: {
            userId: parseInt(userId),
            tier: PaymentTierEnum.PREMIUM,
          },
          data: {
            tier: PaymentTierEnum.FREE,
          },
        })
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

export const runtime = 'edge'

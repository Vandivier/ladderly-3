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
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      // Get customer email from the session
      const customerEmail = session.customer_details?.email

      if (!customerEmail) {
        throw new Error('No customer email found')
      }

      // Find user by email
      const user = await db.user.findUnique({
        where: { email: customerEmail },
      })

      if (!user) {
        throw new Error('No user found with email: ' + customerEmail)
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

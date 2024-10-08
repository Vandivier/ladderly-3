import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import db, { PaymentTierEnum, Prisma } from 'db'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
})

export async function POST(req: Request) {
  const body = await req.text()
  let event
  const sig = req.headers.get('stripe-signature') as string

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json(
      { error: 'Webhook signature verification failed.' },
      { status: 400 }
    )
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const subscriptionTier = 'PREMIUM'
      const userId = session?.metadata?.userId

      try {
        if (!userId) {
          throw new Error(
            `Can't update subscription for Stripe Session ID: ${
              session.id
            }. Stripe identifies customer_email as: ${
              session.customer_email || ''
            }`
          )
        }

        const where: Prisma.SubscriptionWhereUniqueInput = {
          userId_type: {
            type: PaymentTierEnum.PREMIUM,
            userId: parseInt(userId),
          },
        }
        const updated = await db.user.update({
          where: { id: parseInt(userId) },
          data: {
            subscriptions: {
              update: {
                where,
                data: { tier: subscriptionTier },
              },
            },
          },
        })

        console.log(
          `Successfully updated user.id ${updated.id} subscription to ${subscriptionTier}`
        )
      } catch (err) {
        console.error(`Failed to update user subscription: ${err.message}`)
        return NextResponse.json(
          { error: 'Failed to update user subscription.' },
          { status: 500 }
        )
      }

      break
    }
    default:
      console.warn(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
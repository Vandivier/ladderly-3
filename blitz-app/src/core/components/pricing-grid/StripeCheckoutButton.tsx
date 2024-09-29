'use client'

import React from 'react'
import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
)

export const StripeCheckoutButton = ({
  stripeProductId,
}: {
  stripeProductId: string
}) => {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: stripeProductId, // TODO: maybe wrong
        }),
      })

      const { sessionId } = await response.json()
      const stripe = await stripePromise
      const { error } = await stripe!.redirectToCheckout({ sessionId })

      if (error) {
        console.error('Stripe checkout error:', error.message)
      }
    } catch (error) {
      console.error('An error occurred:', error)
    }

    setLoading(false)
  }

  return (
    <button onClick={handleCheckout} disabled={loading}>
      {loading ? 'Loading...' : 'Subscribe Now'}
    </button>
  )
}

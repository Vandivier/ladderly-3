'use client'

import React from 'react'
import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
)

export const StripeCheckoutButton = ({
  stripeProductPriceId,
  userId,
}: {
  stripeProductPriceId: string
  userId: number
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
          priceId: stripeProductPriceId,
          userId,
        }),
      })

      const { sessionId } = (await response.json()) as { sessionId: string }
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
    <button
      className="mx-auto mt-auto flex rounded-lg bg-ladderly-pink px-6 py-2 text-lg font-bold text-white transition-all duration-300 ease-in-out hover:shadow-custom-purple"
      onClick={handleCheckout}
      disabled={loading}
    >
      {loading ? 'Loading...' : 'Join Now'}
    </button>
  )
}

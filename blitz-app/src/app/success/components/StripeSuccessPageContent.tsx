'use client'

import React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import getSettings from '../../settings/queries/getSettings'
import { useQuery } from '@blitzjs/rpc'

const StripeSuccessPageErrorView = () => (
  <>
    <h1 className="mb-4 text-center text-2xl font-bold">Payment not found!</h1>
    <p>
      If you made an update to your Stripe payment subscription, wait ten
      minutes and check the Settings Page to ensure the update succeeded. If an
      issue persists, contact{' '}
      <Link href="mailto:admin@ladderly.io">admin@ladderly.io</Link> to manually
      resolve the issue.
    </p>
    <Link href="/">Return to Home</Link>
  </>
)

export default function StripeSuccessPageContent() {
  const [settings, { refetch }] = useQuery(getSettings, null)
  const params = useSearchParams()
  const stripeSessionId = params?.get('session_id')
  const confirmedSubscriptionLevel = settings.subscription.tier

  if (!stripeSessionId) {
    return <StripeSuccessPageErrorView />
  }

  if (!confirmedSubscriptionLevel) {
    return <p>Loading...</p>
  }

  return (
    <>
      <h1 className="mb-4 text-center text-2xl font-bold">Success!</h1>
      <p className="my-4 max-w-[400px] text-sm">
        Your Stripe subscription update has been confirmed. Your subscription
        level is now {confirmedSubscriptionLevel}.
      </p>
    </>
  )
}

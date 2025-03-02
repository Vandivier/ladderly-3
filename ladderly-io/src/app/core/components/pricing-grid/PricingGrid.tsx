'use server'

import { PaymentTierEnum, type Subscription } from '@prisma/client'
import Link from 'next/link'
import React from 'react'
import type { UserWithSubscriptionsOrZero } from '~/server/schemas'
import { api } from '~/trpc/server'

type Benefit = {
  paragraphContent?: React.ReactNode
  text: string
  url?: string
}

type Plan = {
  name: string
  planId: number
  price: string
  benefits: Benefit[]
  buttonText: string | null
  relatedTier: PaymentTierEnum
  stripePaymentLink?: string
  stripeProductPriceId?: string
  stripeProductId?: string
}

const plans: Plan[] = [
  {
    name: 'Premium',
    planId: 40,
    price: '$6/mo',
    benefits: [
      { text: 'Video Course Access' },
      { text: 'Advanced Checklist Access' },
      { text: 'Paywalled Article Access' },
    ],
    buttonText: 'Join Now',
    relatedTier: PaymentTierEnum.PREMIUM,
    stripePaymentLink: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK,
    stripeProductPriceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID,
    stripeProductId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRODUCT_ID,
  },
  {
    name: 'Free',
    planId: 0,
    price: '$0',
    benefits: [
      {
        text: 'Open Source Curriculum',
        url: 'https://github.com/Vandivier/ladderly-slides/blob/main/CURRICULUM.md',
      },
      { text: 'Standard Checklist' },
      { text: 'Access the Social Community' },
    ],
    buttonText: null,
    relatedTier: PaymentTierEnum.FREE,
  },
]

const BenefitListItem: React.FC<{ benefit: Benefit }> = ({ benefit }) => {
  if (benefit.url) {
    benefit.paragraphContent = (
      <Link
        className="text-ladderly-violet-700 hover:underline"
        href={{ pathname: benefit.url }}
        target="_blank"
      >
        {benefit.text}
      </Link>
    )
  }

  return (
    <li className="flex items-center space-x-2">
      <span className="mr-2">⭐</span>
      <p className="text-left">{benefit.paragraphContent ?? benefit.text}</p>
    </li>
  )
}

const LoggedOutPlanButton = ({ planId }: { planId: number }) => (
  <Link
    href={`/signup?planId=${planId}`}
    className="mx-auto mt-auto flex rounded-lg bg-ladderly-pink px-6 py-2 text-lg font-bold text-white transition-all duration-300 ease-in-out hover:shadow-custom-purple"
  >
    Join Now
  </Link>
)

const PlanCard: React.FC<{
  plan: Plan
  relatedTier: PaymentTierEnum
  userSubscriptions: Subscription[]
  currentUser: UserWithSubscriptionsOrZero
}> = ({ plan, relatedTier, userSubscriptions, currentUser }) => {
  let hasRelatedTier = false
  const isGuest = currentUser === 0

  if (!isGuest) {
    if (relatedTier === PaymentTierEnum.FREE) {
      hasRelatedTier = true
    } else {
      hasRelatedTier = userSubscriptions.some(
        (subscription) => subscription.tier === relatedTier,
      )
    }
  }

  let elRelatedTier = null
  if (relatedTier && !isGuest) {
    elRelatedTier = hasRelatedTier ? (
      <p>You already have access to this plan!</p>
    ) : (
      <Link
        href={{
          pathname: plan.stripePaymentLink,
          query: {
            client_reference_id: currentUser.id.toString(),
          },
        }}
        className="mx-auto mt-auto flex rounded-lg bg-ladderly-pink px-6 py-2 text-lg font-bold text-white transition-all duration-300 ease-in-out hover:shadow-custom-purple"
        target="_self"
      >
        {plan.buttonText}
      </Link>
    )
  }

  return (
    <div
      key={plan.planId}
      className="flex flex-col rounded-lg bg-white p-6 shadow-lg"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">{plan.name}</h2>
        <p className="text-xl">{plan.price}</p>
      </div>

      <ul className="mb-4 space-y-2">
        {plan.benefits.map((benefit) => (
          <BenefitListItem benefit={benefit} key={benefit.text} />
        ))}
      </ul>

      {currentUser ? (
        elRelatedTier
      ) : (
        <LoggedOutPlanButton planId={plan.planId} />
      )}
    </div>
  )
}

const PricingGrid: React.FC = async () => {
  const currentUser: UserWithSubscriptionsOrZero =
    await api.user.getCurrentUser()

  return (
    <div className="mx-auto mt-2 max-w-7xl rounded-lg bg-frost p-6">
      <h2 className="mb-4 text-center text-2xl font-bold">Pricing Plans</h2>

      <div className="mb-2 w-[300px] rounded-lg bg-white p-6 shadow-lg lg:w-auto">
        <h3 className="mb-2 text-2xl font-bold">Get Premium for Free!</h3>
        <p className="text-gray-800">
          Use this{' '}
          <Link
            className="text-m font-bold text-ladderly-pink hover:underline"
            href="https://docs.google.com/document/d/1DtwRvBRimmSiuQ-jkKo_P9QNBPLKQkFemR9vT_Kl9Jg"
            target="_blank"
          >
            Reimbursement Request Letter
          </Link>{' '}
          to request coverage through your employer{`'`}s training and education
          budget.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <PlanCard
            key={plan.planId}
            currentUser={currentUser}
            plan={plan}
            relatedTier={plan.relatedTier}
            userSubscriptions={
              currentUser === 0 ? [] : currentUser.subscriptions
            }
          />
        ))}
      </div>
    </div>
  )
}

export default PricingGrid

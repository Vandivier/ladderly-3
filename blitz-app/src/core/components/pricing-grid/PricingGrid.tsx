import React from 'react'
import Link from 'next/link'
import { useCurrentUser } from 'src/app/users/hooks/useCurrentUser'
import { StripeCheckoutButton } from './StripeCheckoutButton'

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
  loggedInLink?: string
  stripeProductPriceId?: string
  stripeProductId?: string
}

const plans: Plan[] = [
  {
    name: 'Premium',
    planId: 40,
    price: '$40/mo',
    benefits: [
      { text: 'Video Course Access' },
      { text: 'Advanced Checklist Access' },
      { text: 'Paywalled Article Access' },
      { text: 'Exclusive events and early access to new features!' },
      {
        text: 'Recognition in the Hall of Fame (Optional)',
        url: 'https://www.ladderly.io/community/hall-of-fame',
      },
    ],
    buttonText: 'Join Now',
    loggedInLink: 'https://buy.stripe.com/fZe2bF4mo6Td7lK004',
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
      {
        text: '24/7 Support with AI Chat',
        url: 'https://chat.openai.com/g/g-kc5v7DPAm-ladderly-custom-gpt',
      },
      { text: 'Schedule Expert Consultations' },
    ],
    buttonText: null,
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

const PricingGrid: React.FC = () => {
  const currentUser = useCurrentUser()

  return (
    <div className="mx-auto mt-4 max-w-7xl rounded-lg bg-frost p-6">
      <h2 className="mb-4 text-center text-2xl font-bold">Pricing Plans</h2>

      <div
        className={`m-2 w-[300px] rounded-lg bg-white p-2 shadow-lg lg:w-auto`}
      >
        <h3 className="mb-2 text-2xl font-bold">Get Premium for Free!</h3>
        <p className="text-gray-800">
          Use this{' '}
          <Link
            className="text-m font-bold text-ladderly-pink hover:underline"
            href={
              'https://docs.google.com/document/d/1DtwRvBRimmSiuQ-jkKo_P9QNBPLKQkFemR9vT_Kl9Jg'
            }
            target="_blank"
          >
            Reimbursement Request Letter
          </Link>{' '}
          to request coverage through your employer{`'`}s training and education
          budget.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {plans.map((plan, i) => (
          <div
            key={i}
            className="flex flex-col rounded-lg bg-white p-6 shadow-lg"
          >
            <h2 className="mb-2 text-2xl font-bold">{plan.name}</h2>
            <p className="mb-4 text-xl">{plan.price}</p>

            <ul className="mb-4 space-y-2">
              {plan.benefits.map((benefit) => (
                <BenefitListItem benefit={benefit} key={benefit.text} />
              ))}
            </ul>

            {currentUser &&
              plan.buttonText &&
              plan.loggedInLink &&
              !plan.stripeProductPriceId && (
                <Link
                  href={{ pathname: plan.loggedInLink }}
                  className="mx-auto mt-auto flex rounded-lg bg-ladderly-pink px-6 py-2 text-lg font-bold text-white transition-all duration-300 ease-in-out hover:shadow-custom-purple"
                  target="_blank"
                >
                  {plan.buttonText}
                </Link>
              )}

            {currentUser && plan.buttonText && plan.stripeProductPriceId && (
              <StripeCheckoutButton
                stripeProductPriceId={plan.stripeProductPriceId}
                userId={currentUser.id}
              />
            )}

            {!currentUser ? <LoggedOutPlanButton planId={plan.planId} /> : null}
          </div>
        ))}
      </div>
    </div>
  )
}

export default PricingGrid

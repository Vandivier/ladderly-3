import React from 'react'
import Link from 'next/link'
import { useCurrentUser } from 'src/app/users/hooks/useCurrentUser'

type Benefit = {
  emphasize?: boolean
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
}

const plans: Plan[] = [
  {
    name: 'Premium',
    planId: 30,
    price: '$30/mo',
    benefits: [
      { emphasize: true, text: 'Limited Time Only: Free Expert Session' },
      { text: 'All "Pay What You Can" plan benefits' },
      { text: '25% discount on Expert Sessions' },
      { text: 'Exclusive small groups and giveaways' },
      {
        text: 'Recognition in the Hall of Fame (Optional)',
        url: 'https://www.ladderly.io/community/hall-of-fame',
      },
    ],
    buttonText: 'Join Now',
    loggedInLink: 'https://buy.stripe.com/fZe2bF4mo6Td7lK004',
  },
  {
    name: 'Pay What You Can',
    planId: 10,
    price: 'as little as $1/mo',
    benefits: [
      { text: '10% discount on Expert Sessions' },
      { text: 'Advanced Checklist Access' },
      { text: 'Ad-Free Experience' },
      { text: 'Priority Support' },
    ],
    buttonText: 'Join Now',
    loggedInLink: 'https://buy.stripe.com/dR67vZbOQfpJ21qdQT',
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
  const isLoggedIn = Boolean(currentUser)

  return (
    <div className="mx-auto mt-4 max-w-7xl rounded-lg bg-frost p-6">
      <h1 className="mb-4 text-center text-2xl font-bold">Pricing Plans</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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

            {isLoggedIn && plan.buttonText && plan.loggedInLink && (
              <Link
                href={{ pathname: plan.loggedInLink }}
                className="mx-auto mt-auto flex rounded-lg bg-ladderly-pink px-6 py-2 text-lg font-bold text-white transition-all duration-300 ease-in-out hover:shadow-custom-purple"
                target="_blank"
              >
                {plan.buttonText}
              </Link>
            )}

            {!isLoggedIn ? <LoggedOutPlanButton planId={plan.planId} /> : null}
          </div>
        ))}
      </div>
    </div>
  )
}

export default PricingGrid

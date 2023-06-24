import React from "react"
import Link from "next/link"
import { Routes } from "@blitzjs/next"

const tiers = [
  {
    name: "Forever Free Tier",
    price: "Free",
    benefits: [
      "Open Source Curriculum",
      "Basic Checklist",
      "Access to the community",
      "Periodic Coupons",
    ],
    buttonText: null,
  },
  {
    name: "Pay What You Want Tier (as little as $1/mo)",
    price: "$1/mo",
    benefits: [
      'Access to the "advanced checklist"',
      "Ad-free experience",
      "Priority communication and meeting scheduling",
      "Limited time offer: complimentary 30-minute session and 50% off all additional sessions",
      "Influence on the development roadmap",
      "Contribute to the community bounty: No ads for all if the community subscription bounty is met",
      "Discounts on all merchandise from the Coding Life Store, Ladderly IRL event tickets, and 1:1 sessions",
    ],
    buttonText: "Upgrade Now",
  },
  {
    name: "Premium Tier ($30/mo + optional tips)",
    price: "$30/mo",
    benefits: [
      'All benefits of the "Pay What You Want" tier',
      "Free access to all Ladderly In Real Life (IRL) events",
      "Accrue free session time and receive limited-edition seasonal merchandise",
      'Your subscription helps keep the cost extremely low ("pay what you want") for others',
      "Greater influence on the development roadmap",
      "Recognition through a banner on the website, social media shout-outs, and mentions on Ladderly GitHub repository README files",
      "Transferable session time coupons",
      "Contribute to the community bounty: No ads for all if the community subscription bounty is met",
      "(Coming Soon) 24/7 Access to the Ladderly Chatbot",
    ],
    buttonText: "Upgrade Now",
  },
]

const PricingGrid: React.FC = () => {
  return (
    <div className="bg-frost p-6 rounded-lg max-w-7xl mx-auto mt-10">
      <h1 className="text-4xl mb-10 text-center font-bold">Pricing Plans</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiers.map((tier, i) => (
          <div key={i} className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl mb-2 font-bold">{tier.name}</h2>
            <p className="text-xl mb-4">{tier.price}</p>

            <ul className="mb-4 space-y-2">
              {tier.benefits.map((benefit, j) => (
                <li key={j} className="flex items-start">
                  <span className="mr-2">⭐</span>
                  <p className="text-left">{benefit}</p>
                </li>
              ))}
            </ul>

            {tier.buttonText && (
              <div>
                <Link
                  href={Routes.SignupPage()}
                  className="inline-block bg-ladderly-pink text-white px-6 py-2 rounded-lg text-lg font-bold transition-all duration-300 ease-in-out hover:shadow-custom-purple"
                >
                  {tier.buttonText}
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default PricingGrid

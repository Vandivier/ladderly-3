import React from "react"
import Link from "next/link"
import { Routes } from "@blitzjs/next"

const plans = [
  {
    name: "Premium",
    price: "$30/mo",
    benefits: [
      'All "Pay What You Can" plan benefits',
      "Free access to all Ladderly In Real Life (IRL) events",
      "Accrue free session time and receive limited-edition seasonal merchandise",
      'Your subscription helps keep the cost extremely low ("pay what you want") for others',
      "Greater influence on the development roadmap",
      "Recognition through a banner on the website, social media shout-outs, and mentions on Ladderly GitHub repository README files",
      "Transferable session time coupons",
      "Contribute to the community bounty: No ads for all if the community subscription bounty is met",
      "(Coming Soon) 24/7 Access to the Ladderly Chatbot",
    ],
    buttonText: "Join Now",
    link: "https://buy.stripe.com/fZe2bF4mo6Td7lK004",
  },
  {
    name: "Pay What You Can",
    price: "as little as $1/mo",
    benefits: [
      "Limited time offer: complimentary 30-minute session and 50% off all additional sessions",
      "Ad-free experience",
      "Priority support",
      "Advanced Checklist Access (10 Additional Items)",
      "Influence the development roadmap",
      "Contribute to the community bounty: No ads for all if the community subscription bounty is met",
      "Discounted Store and Expert Consultation Prices",
    ],
    buttonText: "Join Now",
    link: "https://buy.stripe.com/dR67vZbOQfpJ21qdQT",
  },
  {
    name: "Free",
    price: "$0",
    benefits: [
      "Open Source Curriculum",
      "Standard Checklist",
      "Access the Social Community",
      "Schedule Expert Consultations",
      "Store Access",
    ],
    buttonText: null,
  },
]

const PricingGrid: React.FC = () => {
  return (
    <div className="bg-frost p-6 rounded-lg max-w-7xl mx-auto mt-10">
      <h1 className="text-4xl mb-10 text-center font-bold">Pricing Plans</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan, i) => (
          <div key={i} className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl mb-2 font-bold">{plan.name}</h2>
            <p className="text-xl mb-4">{plan.price}</p>

            <ul className="mb-4 space-y-2">
              {plan.benefits.map((benefit, j) => (
                <li key={j} className="flex items-start">
                  <span className="mr-2">⭐</span>
                  <p className="text-left">{benefit}</p>
                </li>
              ))}
            </ul>

            {plan.buttonText && plan.link && (
              <div>
                <Link
                  href={plan.link}
                  className="bg-ladderly-pink text-white px-6 py-2 rounded-lg text-lg font-bold transition-all duration-300 ease-in-out hover:shadow-custom-purple"
                  style={{
                    display: "flex",
                    margin: "1rem auto",
                    width: "max-content",
                  }}
                  target="_blank"
                >
                  {plan.buttonText}
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

// src/app/HomePageContent.tsx

'use client'

import { PaymentTierEnum } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'

import useSubscriptionLevel from 'src/app/users/hooks/useSubscriptionLevel'
import { LadderlyPageWrapper } from 'src/core/components/page-wrapper/LadderlyPageWrapper'
import PricingGrid from 'src/core/components/pricing-grid/PricingGrid'

import React from 'react'
import styles from 'src/app/styles/Home.module.css'
import { useTheme } from 'src/core/theme/ThemeContext'

type Testimonial = {
  testimonialGiverName: string
  testimonialLinkedInUrl: string
  testimonialText: string
}

const defaultTestimonial: Testimonial = {
  testimonialGiverName: 'Calvin He',
  testimonialLinkedInUrl: 'https://www.linkedin.com/in/calvin-h-he/',
  testimonialText: `Ladderly.io's advice and Leetcode Kata helped me fill in the gaps from my web development boot camp. Without John's generous resume review and career advice, I wouldn't have landed my remote job this year!`,
}

const testimonials: Testimonial[] = [
  defaultTestimonial,
  {
    testimonialGiverName: 'Chris Flannery',
    testimonialLinkedInUrl: 'https://www.linkedin.com/in/chriswillsflannery/',
    testimonialText: `The Ladderly Leetcode Kata is awesome. After using it for about two months, I'm notably more efficient and confident in coding interviews.`,
  },
  {
    testimonialGiverName: 'Isaiah LaDuke',
    testimonialLinkedInUrl: 'https://www.linkedin.com/in/isaiah-laduke/',
    testimonialText: `It can't be overstated that Ladderly was crucial to my career. From coding, to interviews, to resume advice, to simple encouragement, I received more help than I thought I would be able to gain.`,
  },
  {
    testimonialGiverName: 'Pratik Thorat',
    testimonialLinkedInUrl: 'https://www.linkedin.com/in/pratikwebworks/',
    testimonialText: `I just got off of an interview that I obtained thanks to Ladderly's Networking Scripts. My resume was passed down to the hiring manager. I owe everything to John and Ladderly.io's open-source curriculum!`,
  },
  {
    testimonialGiverName: 'Jonathan Norstrom',
    testimonialLinkedInUrl: 'https://www.linkedin.com/in/norstromjonathan/',
    testimonialText: `I was laid off and my confidence took a hit. Interviewing was hard in ways that I’d forgotten about. Thankfully, John Vandivier stepped in as a mentor, ran a mock interview, and we created a plan to improve my weak areas. He was kind and knowledgeable. I signed offer within two months.`,
  },
]

const TestimonialBlock = () => {
  const randomTestimonial =
    testimonials[Math.floor(Math.random() * testimonials.length)] ??
    defaultTestimonial

  return (
    <div>
      <p className="mb-4 text-gray-800">
        {`"${randomTestimonial.testimonialText}"`}
      </p>
      <p className="font-bold">{randomTestimonial.testimonialGiverName}</p>
      {randomTestimonial.testimonialLinkedInUrl ? (
        <a
          href={randomTestimonial.testimonialLinkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Connect on LinkedIn
        </a>
      ) : null}
    </div>
  )
}

const LadderlyHelpsContentBlock = () => {
  const { theme } = useTheme()

  return (
    <div>
      <h2 className="my-6 text-2xl font-bold">Ladderly Helps You:</h2>
      <ol className="flex list-none flex-col gap-3">
        <li className="flex items-center">
          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/50">
            1
          </div>
          <span className="rounded-md bg-purple-300/20 p-2">learn to code</span>
        </li>
        <li className="flex items-center">
          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/50">
            2
          </div>
          <span className="rounded-md bg-purple-300/20 p-2">
            land your first or next programming role
          </span>
        </li>
        <li className="flex items-center">
          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/50">
            3
          </div>
          <span className="rounded-md bg-purple-300/20 p-2">
            grow social and professional networks
          </span>
        </li>
        <li className="m-3">
          <a
            href="https://www.producthunt.com/posts/ladderly-io?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-ladderly&#0045;io"
            target="_blank"
          >
            <Image
              src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=480223&theme=${theme}`}
              alt="Ladderly&#0046;io - Land&#0032;your&#0032;next&#0032;programming&#0032;role&#0033; | Product Hunt"
              style={{ margin: 'auto' }}
              width="250"
              height="54"
            />
          </a>
        </li>
      </ol>
    </div>
  )
}

const AdvancedChecklistContentBlock = () => {
  const { tier } = useSubscriptionLevel()
  const isPaid = tier != PaymentTierEnum.FREE

  return isPaid ? (
    <div
      className={`m-2 w-[300px] rounded-lg bg-white p-2 shadow-lg lg:w-auto`}
    >
      <p className="text-gray-800">
        As a paid member, you can access the{' '}
        <Link
          className="text-m font-bold text-ladderly-pink hover:underline"
          href={'/checklists/my-premium-checklist'}
        >
          Advanced Checklist
        </Link>
        !
      </p>
    </div>
  ) : null
}

const HomePage = () => (
  <LadderlyPageWrapper title="Home">
    <main style={{ padding: '0rem 1rem' }}>
      <div className={styles.wrapper}>
        <div
          className={`mx-auto flex flex-wrap gap-0 rounded-lg bg-frost p-2 sm:flex-nowrap sm:gap-16`}
        >
          <Image
            alt="Ladderly Logo"
            className="m-auto block rounded-lg shadow-lg sm:hidden"
            height={270}
            priority={true}
            src="/logo.png"
            style={{ alignSelf: 'center', maxHeight: '160px' }}
            width={270}
          />

          <Image
            alt="Ladderly Logo"
            height={330}
            className="m-6 hidden rounded-lg shadow-lg sm:block"
            priority={true}
            src="/logo.png"
            style={{ alignSelf: 'center', maxHeight: '200px' }}
            width={330}
          />

          <LadderlyHelpsContentBlock />
        </div>

        <div className="flex flex-col items-center">
          <div className="flex flex-col justify-center sm:mt-4 sm:flex-row">
            <section id="testimonials">
              <h2 className="text-l mt-3 px-6 font-bold text-gray-800 sm:text-xl">
                Why Users Love Us:
              </h2>
              <div
                className={`${styles['next-steps-card']} rounded-lg bg-white p-6 shadow-lg`}
              >
                <TestimonialBlock />
              </div>
            </section>

            <section id="recommended-next-steps" className="flex flex-col">
              <div
                className={`${styles['next-steps-card']} rounded-lg bg-white p-6 shadow-lg`}
              >
                <h2 className="text-l mb-2 font-bold text-gray-800 sm:text-xl">
                  Recommended Next Steps:
                </h2>
                <h2 className="text-l font-bold text-gray-800">
                  Complete the{' '}
                  <Link
                    className="text-l font-bold text-ladderly-pink hover:underline"
                    href={'/checklists/my-basic-checklist'}
                  >
                    Standard Checklist
                  </Link>
                  ,{' '}
                  <span className="text-l font-bold">
                    consider one of the paid plans below
                  </span>
                  , and{' '}
                  <Link
                    className="text-l font-bold text-ladderly-pink hover:underline"
                    href={'https://buy.stripe.com/cN2bMfbOQ2CX5dC7su'}
                    target="_blank"
                  >
                    Book an Expert Session
                  </Link>
                  !
                </h2>
              </div>

              <div
                className={`${styles['next-steps-card']} rounded-lg bg-white p-2 shadow-lg`}
              >
                <p>
                  To support Ladderly{"'"}s mission to provide low-cost
                  education in STEM, consider{' '}
                  <Link
                    className="text-m font-bold text-ladderly-pink hover:underline"
                    href={'https://buy.stripe.com/eVa9E72egelFfSgfYZ'}
                    target="_blank"
                  >
                    leaving a tip
                  </Link>
                  .
                </p>
              </div>
            </section>
          </div>

          <Suspense>
            <AdvancedChecklistContentBlock />
          </Suspense>

          <PricingGrid />
        </div>
      </div>
    </main>
  </LadderlyPageWrapper>
)

export default HomePage

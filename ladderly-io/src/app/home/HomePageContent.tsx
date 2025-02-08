// src/app/HomePageContent.tsx

import { PaymentTierEnum } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'

import React from 'react'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import PricingGrid from '~/app/core/components/pricing-grid/PricingGrid'
import type { LadderlySession } from '~/server/auth'
import { LadderlyHelpsBlock } from './LadderlyHelpsBlock'
import { TestimonialBlock } from './TestimonialBlock'

import styles from '~/styles/Home.module.css'
import Script from 'next/script'

// note: do not extract `DARK_MODE_STANDARD_CLASSES` out of file.
// it is duplicated intentionally between files to ensure tailwind classes are bundled
const DARK_MODE_STANDARD_CLASSES =
  'dark:bg-ladderly-dark-purple-2 dark:text-white'

const HomePageCardSubheading = ({
  children,
}: {
  children: React.ReactNode
}) => <h2 className="mb-2 text-xl font-bold">{children}</h2>

const AdvancedChecklistContentBlock = ({
  session,
}: {
  session: LadderlySession | null
}) => {
  const isPaid = session?.user?.subscription.tier !== PaymentTierEnum.FREE

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

const HomePageContent = ({ session }: { session: LadderlySession | null }) => (
  <LadderlyPageWrapper>
    <div
      id="chatbot-subheading"
      className="bg-pink-300 text-center text-ladderly-dark-purple-2 dark:bg-ladderly-dark-purple-2 dark:text-white"
    >
      <h2>
        New: 5 Ladderly AI Tools!{' '}
        <Link
          className="mx-2 font-bold underline"
          href="/blog/2025-02-07-ladderly-chat-ai"
        >
          Read the announcement
        </Link>
        or
        <Link className="mx-2 font-bold underline" href="/general-chat">
          chat now!
        </Link>
      </h2>

      <Script>
        {`
        // ref: https://www.chatbase.co/docs/developer-guides/identity-verification
        (function(){if(!window.chatbase||window.chatbase("getState")!=="initialized"){window.chatbase=(...arguments)=>{if(!window.chatbase.q){window.chatbase.q=[]}window.chatbase.q.push(arguments)};window.chatbase=new Proxy(window.chatbase,{get(target,prop){if(prop==="q"){return target.q}return(...args)=>target(prop,...args)}})}const onLoad=function(){const script=document.createElement("script");script.src="https://www.chatbase.co/embed.min.js";script.id="NnbDY2pCxZROnVKZwpjaW";script.domain="www.chatbase.co";document.body.appendChild(script)};if(document.readyState==="complete"){onLoad()}else{window.addEventListener("load",onLoad)}})();
        `}
      </Script>
    </div>
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

          <LadderlyHelpsBlock />
        </div>

        <div className="mt-2 flex flex-col items-center">
          <div className="flex flex-col justify-center sm:mt-4 sm:flex-row">
            <section id="testimonials">
              <div
                className={`text-gray-800 ${DARK_MODE_STANDARD_CLASSES} ${styles['next-steps-card']} rounded-lg bg-white p-6 shadow-lg`}
              >
                <HomePageCardSubheading>
                  Why Users Love Us:
                </HomePageCardSubheading>
                <TestimonialBlock />
              </div>
            </section>

            <section id="recommended-next-steps" className="flex flex-col">
              <div
                className={`text-gray-800 ${DARK_MODE_STANDARD_CLASSES} ${styles['next-steps-card']} rounded-lg bg-white p-6 shadow-lg`}
              >
                <HomePageCardSubheading>
                  Recommended Next Steps:
                </HomePageCardSubheading>
                <p className="text-l font-bold">
                  Complete the{' '}
                  <Link
                    className="text-ladderly-pink hover:underline"
                    href={'/checklists/my-basic-checklist'}
                  >
                    Standard Checklist
                  </Link>
                  , consider one of the paid plans below, and{' '}
                  <Link
                    className="text-ladderly-pink hover:underline"
                    href={'https://buy.stripe.com/cN2bMfbOQ2CX5dC7su'}
                    target="_blank"
                  >
                    Book an Expert Session
                  </Link>
                  !
                </p>
              </div>

              <div
                className={`text-gray-800 ${DARK_MODE_STANDARD_CLASSES} ${styles['next-steps-card']} rounded-lg bg-white p-2 shadow-lg`}
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

          <AdvancedChecklistContentBlock session={session} />
          <PricingGrid />
        </div>
      </div>
    </main>
  </LadderlyPageWrapper>
)

export default HomePageContent

"use client"

import { PaymentTierEnum } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"

import { LadderlyPageWrapper } from "src/core/components/page-wrapper/LadderlyPageWrapper"
import PricingGrid from "src/core/components/pricing-grid/PricingGrid"
import useSubscriptionLevel from "./users/hooks/useSubscriptionLevel"

import styles from "src/app/styles/Home.module.css"

const LadderlyHelpsContentBlock = () => {
  return (
    <div>
      <h2 className="my-6 text-2xl font-bold">Ladderly Helps You:</h2>
      <ol className="list-none space-y-3">
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
      </ol>
    </div>
  )
}

const AdvancedChecklistContentBlock = () => {
  const { tier } = useSubscriptionLevel()
  const isPaid = tier != PaymentTierEnum.FREE

  return isPaid ? (
    <div
      className={`${styles.nextStepsCard} rounded-lg bg-white p-2 shadow-lg`}
      style={{ marginTop: "0.5rem" }}
    >
      <h3 className="text-m font-bold text-gray-800">
        As a paid member, you can access the{" "}
        <Link
          className="text-m font-bold text-ladderly-pink hover:underline"
          href={"/checklists/my-premium-checklist"}
        >
          Advanced Checklist
        </Link>
        !
      </h3>
    </div>
  ) : null
}

const HomePage = () => (
  <LadderlyPageWrapper title="Home">
    <main style={{ padding: "0rem 1rem" }}>
      <div className={styles.wrapper}>
        <div
          className={`mx-auto my-6 flex flex-wrap gap-0 rounded-lg bg-frost p-2 sm:flex-nowrap sm:gap-16`}
        >
          <Image
            alt="Ladderly Logo"
            className="m-auto block rounded-lg shadow-lg sm:hidden"
            height={270}
            priority={true}
            src="/logo.png"
            width={270}
          />

          <Image
            alt="Ladderly Logo"
            height={330}
            className="m-6 hidden rounded-lg shadow-lg sm:block"
            priority={true}
            src="/logo.png"
            width={330}
          />

          <LadderlyHelpsContentBlock />
        </div>

        <div>
          <div
            className={`${styles.nextStepsCard} rounded-lg bg-white p-6 shadow-lg`}
          >
            <h2
              className="text-2xl font-bold text-gray-800"
              style={{ marginBottom: "0.5rem" }}
            >
              Recommended Next Steps:
            </h2>
            <h2 className="text-2xl font-bold text-gray-800">
              Complete the{" "}
              <Link
                className="text-2xl font-bold text-ladderly-pink hover:underline"
                href={"/checklists/my-basic-checklist"}
              >
                Standard Checklist
              </Link>
              ,{" "}
              <span className="text-2xl font-bold">
                consider one of the paid plans below
              </span>
              , and{" "}
              <Link
                className="text-2xl font-bold text-ladderly-pink hover:underline"
                href={"https://buy.stripe.com/cN2bMfbOQ2CX5dC7su"}
                target="_blank"
              >
                Book an Expert Session
              </Link>
              !
            </h2>
          </div>

          <div
            className={`${styles.nextStepsCard} rounded-lg bg-white p-2 shadow-lg`}
            style={{ marginTop: "0.5rem" }}
          >
            <h3 className="text-m font-bold text-gray-800">
              To support Ladderly{"'"}s mission to provide low-cost education in
              STEM, consider{" "}
              <Link
                className="text-m font-bold text-ladderly-pink hover:underline"
                href={"https://buy.stripe.com/eVa9E72egelFfSgfYZ"}
                target="_blank"
              >
                leaving a tip
              </Link>
              .
            </h3>
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

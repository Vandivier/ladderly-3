import { BlitzPage, Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { PaymentTierEnum } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import logout from "src/auth/mutations/logout"
import PricingGrid from "src/core/components/pricing-grid/PricingGrid"
import Layout from "src/core/layouts/Layout"
import styles from "src/styles/Home.module.css"
import { useCurrentUser } from "src/users/hooks/useCurrentUser"
import useSubscriptionLevel from "src/users/hooks/useSubscriptionLevel"

const LadderlyHelpsContentBlock = () => {
  return (
    <div className={`${styles.body} bg-frost`}>
      <div className={styles.instructions}>
        <h2 className="text-2xl font-bold text-gray-800">Ladderly Helps You:</h2>

        <div>
          <div className={styles.code}>
            <span>1</span>
            <p>learn to code</p>
          </div>

          <div className={styles.code}>
            <span>2</span>
            <p>land your first or next programming role</p>
          </div>

          <div className={styles.code}>
            <span>3</span>
            <p>grow social and professional networks</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const LogoutButton = () => {
  const [logoutMutation] = useMutation(logout)

  return (
    <button
      className="ml-6"
      onClick={async () => {
        await logoutMutation()
      }}
    >
      <strong>Logout</strong>
    </button>
  )
}

export const TopNavContent = () => {
  const currentUser = useCurrentUser()

  if (currentUser) {
    return (
      <p style={{ marginLeft: "auto" }}>
        <Link href={Routes.BlogIndex()} className="ml-6">
          <strong>Blog</strong>
        </Link>
        <Link href={Routes.UsersPage()} className="ml-6">
          <strong>Community Directory</strong>
        </Link>
        <Link href={Routes.SettingsPage()} className="ml-6">
          <strong>Settings</strong>
        </Link>
        <LogoutButton />
      </p>
    )
  } else {
    return (
      <p style={{ marginLeft: "auto" }}>
        <Link href={Routes.BlogIndex()} className="ml-6">
          <strong>Blog</strong>
        </Link>
        <Link href={Routes.UsersPage()} className="ml-6">
          <strong>Community Directory</strong>
        </Link>
        <Link href={Routes.LoginPage()} className="ml-6">
          <strong>Login</strong>
        </Link>
        <Link href={Routes.SignupPage()} className="ml-6">
          <strong>Signup</strong>
        </Link>
      </p>
    )
  }
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

const Home: BlitzPage = () => {
  return (
    <Layout title="Home">
      <div className={styles.globe} />

      <div className={styles.container}>
        <div className="border-ladderly-light-purple flex border bg-ladderly-off-white px-4 py-1 text-ladderly-violet-700">
          <Suspense fallback="">
            <TopNavContent />
          </Suspense>
        </div>

        <main className={styles.main}>
          <div className={styles.wrapper}>
            <div className={styles.header}>
              <div>
                <div className={styles.logo}>
                  <Image src="/logo.png" alt="Ladderly Logo" width={300} height={300} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Accelerate Your Tech Career</h2>
              </div>
              <LadderlyHelpsContentBlock />
            </div>

            <div>
              <div className={`${styles.nextStepsCard} rounded-lg bg-white p-6 shadow-lg`}>
                <h2 className="text-2xl font-bold text-gray-800" style={{ marginBottom: "0.5rem" }}>
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
                  , <span className="text-2xl font-bold">consider one of the paid plans below</span>
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
                  To support Ladderly{"'"}s mission to provide low-cost education in STEM, consider{" "}
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

        <footer className={styles.footer}>
          <a
            href="https://discord.gg/fAg6Xa4uxc"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.textLink}
          >
            Discord
          </a>
          <a
            href="https://github.com/Vandivier/ladderly-3#about"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.textLink}
          >
            GitHub
          </a>
          <p>Copyright © 2023 John Vandivier</p>
        </footer>
      </div>
    </Layout>
  )
}

export default Home

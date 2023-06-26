import { BlitzPage, Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import logout from "src/auth/mutations/logout"
import PricingGrid from "src/core/components/pricing-grid/PricingGrid"
import Layout from "src/core/layouts/Layout"
import styles from "src/styles/Home.module.css"
import { useCurrentUser } from "src/users/hooks/useCurrentUser"

const LadderlyHelpsContentBlock = () => {
  return (
    <div className={`${styles.body} bg-frost`}>
      <div className={styles.instructions}>
        <h2 className="text-gray-800 font-bold text-2xl">Ladderly Helps You:</h2>

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

const TopNavContent = () => {
  const currentUser = useCurrentUser()

  if (currentUser) {
    return (
      <p style={{ marginLeft: "auto" }}>
        <Link href={Routes.SettingsPage()} className="ml-6">
          <strong>Settings</strong>
        </Link>
        <LogoutButton />
      </p>
    )
  } else {
    return (
      <p style={{ marginLeft: "auto" }}>
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

const JoinNowCta = () => {
  const currentUser = useCurrentUser()

  return currentUser ? null : (
    <Link
      href={Routes.SignupPage()}
      className="button bg-gradient-to-t bg-ladderly-pink border-ladderly-light-purple text-1.8rem text-white px-6 h-12 w-48 max-w-72 relative inline-flex justify-center items-center flex-none select-none whitespace-nowrap rounded-lg rounded-bl-none text-sm transition-all duration-300 ease-in-out cursor-pointer hover:shadow-custom-purple"
    >
      <strong>Join Now</strong>
    </Link>
  )
}

const Home: BlitzPage = () => {
  return (
    <Layout title="Home">
      <div className={styles.globe} />

      <div className={styles.container}>
        <div className="bg-ladderly-off-white border border-ladderly-light-purple text-ladderly-teal flex py-1 px-4">
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
                <h2 className="text-gray-800 font-bold text-2xl">Accelerate Your Tech Career</h2>
              </div>
              <LadderlyHelpsContentBlock />
            </div>

            <div>
              <div className={`${styles.nextStepsCard} bg-white rounded-lg shadow-lg p-6`}>
                <h2 className="text-gray-800 font-bold text-2xl" style={{ marginBottom: "0.5rem" }}>
                  Recommended Next Steps:
                </h2>
                <h2 className="text-gray-800 font-bold text-2xl">
                  Complete the{" "}
                  <Link
                    className="text-ladderly-pink font-bold text-2xl hover:underline"
                    href={"/checklists/my-basic-checklist"}
                  >
                    Standard Checklist
                  </Link>
                  , <span className="font-bold text-2xl">consider one of the paid plans below</span>
                  , and{" "}
                  <Link
                    className="text-ladderly-pink font-bold text-2xl hover:underline"
                    href={"https://buy.stripe.com/cN2bMfbOQ2CX5dC7su"}
                    target="_blank"
                  >
                    Book an Expert Session
                  </Link>
                  !
                </h2>
              </div>

              <div
                className={`${styles.nextStepsCard} bg-white rounded-lg shadow-lg p-2`}
                style={{ marginTop: "0.5rem" }}
              >
                <h3 className="text-gray-800 font-bold text-m">
                  To support Ladderly{"'"}s mission to provide low-cost education in STEM, consider{" "}
                  <Link
                    className="text-ladderly-pink font-bold text-m hover:underline"
                    href={"https://buy.stripe.com/eVa9E72egelFfSgfYZ"}
                    target="_blank"
                  >
                    leaving a tip
                  </Link>
                  .
                </h3>
              </div>

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

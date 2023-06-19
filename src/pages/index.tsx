import { BlitzPage, Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import logout from "src/auth/mutations/logout"
import Layout from "src/core/layouts/Layout"
import styles from "src/styles/Home.module.css"
import { useCurrentUser } from "src/users/hooks/useCurrentUser"

const UserInfo = () => {
  const currentUser = useCurrentUser()
  const [logoutMutation] = useMutation(logout)

  if (currentUser) {
    return (
      <>
        <button
          className={styles.button}
          onClick={async () => {
            await logoutMutation()
          }}
        >
          Logout
        </button>
        <div>
          User id: <code>{currentUser.id}</code>
          <br />
          User role: <code>{currentUser.role}</code>
        </div>
      </>
    )
  } else {
    return (
      <>
        <Link
          href={Routes.SignupPage()}
          className="button bg-gradient-to-t bg-ladderly-pink border-ladderly-light-purple text-1.8rem text-white px-6 h-12 w-48 max-w-72 relative inline-flex justify-center items-center flex-none select-none whitespace-nowrap rounded-lg rounded-bl-none text-sm transition-all duration-300 ease-in-out cursor-pointer hover:shadow-custom-purple"
        >
          <strong>Join Now</strong>
        </Link>
      </>
    )
  }
}

const Home: BlitzPage = () => {
  return (
    <Layout title="Home">
      <div className={styles.globe} />

      <div className={styles.container}>
        <p className={styles.toastContainer}>
          <Link href={Routes.LoginPage()} className="ml-auto">
            <strong>Login</strong>
          </Link>
        </p>

        <main className={styles.main}>
          <div className={styles.wrapper}>
            <div className={styles.header}>
              <div className={styles.logo}>
                <Image src="/logo.png" alt="Ladderly Logo" width={300} height={300} />
              </div>

              <h2 className="text-gray-800 font-bold text-2xl">Accelerate Your Tech Career</h2>

              <div className={styles.buttonContainer}>
                <Suspense fallback="Loading...">
                  <UserInfo />
                </Suspense>
              </div>
            </div>

            <div className={styles.body}>
              <div className={styles.instructions}>
                <p>
                  <strong>Ladderly Helps You:</strong>
                </p>

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
                    <p>facilitate social networking</p>
                  </div>
                </div>
              </div>

              <div className={styles.linkGrid}>
                <a
                  href="https://github.com/Vandivier/ladderly-3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.card}
                >
                  GitHub Repo
                  <span className={styles.arrowIcon} />
                </a>
                <a
                  href="https://discord.gg/fAg6Xa4uxc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.card}
                >
                  Discord Community
                  <span className={styles.arrowIcon} />
                </a>
              </div>
            </div>
          </div>
        </main>

        <footer className={styles.footer}>
          <span>Powered by</span>
          <a
            href="https://github.com/Vandivier/ladderly-3#about"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.textLink}
          >
            Copyright © 2023 John Vandivier and Ladderly Ecosystem Contributors
          </a>
        </footer>
      </div>
    </Layout>
  )
}

export default Home

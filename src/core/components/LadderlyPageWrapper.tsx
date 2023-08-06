import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import Link from "next/link"
import React from "react"

import logout from "src/auth/mutations/logout"
import { useCurrentUser } from "src/users/hooks/useCurrentUser"
import Layout, { LayoutProps } from "../layouts/Layout"

import styles from "src/styles/Home.module.css"

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
        <Link href={Routes.CommunityPage()} className="ml-6">
          <strong>Community</strong>
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
        <Link href={Routes.CommunityPage()} className="ml-6">
          <strong>Community</strong>
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

export const LadderlyPageWrapper: React.FC<LayoutProps> = ({ children, title }) => (
  <Layout title={title}>
    <div className={styles.container}>
      <div className="border-ladderly-light-purple flex border bg-ladderly-off-white px-4 py-1 text-ladderly-violet-700">
        <React.Suspense fallback="">
          <TopNavContent />
        </React.Suspense>
      </div>

      {children}

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

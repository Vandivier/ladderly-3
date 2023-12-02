import Head from "next/head"
import React from "react"
import { BlitzLayout } from "@blitzjs/next"
import { useRouter } from "next/router"

export type LayoutProps = { title: string; children?: React.ReactNode }

const Layout: BlitzLayout<LayoutProps> = ({ title, children }) => {
  const router = useRouter()
  const canonical = `https://ladderly.io${router.asPath}`
  const preppendedTitle = `ladderly.io | ${title}`

  return (
    <>
      <Head>
        <title>{preppendedTitle || "ladderly.io | Accelerate Your Tech Career"}</title>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="canonical" href={canonical} key="canonical" />
      </Head>

      {children}
    </>
  )
}

export default Layout

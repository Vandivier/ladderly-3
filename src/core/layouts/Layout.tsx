import Head from "next/head"
import React from "react"
import { BlitzLayout } from "@blitzjs/next"

export type LayoutProps = { title: string; children?: React.ReactNode }

const Layout: BlitzLayout<LayoutProps> = ({ title, children }) => {
  return (
    <>
      <Head>
        <title>{title || "Ladderly - Accelerate Your Tech Career"}</title>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>

      {children}
    </>
  )
}

export default Layout

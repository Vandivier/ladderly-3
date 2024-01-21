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
        <title>{preppendedTitle}</title>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="canonical" href={canonical} key="canonical" />

        <meta property="og:image" content="https://www.ladderly.io/logo.png" />
        <meta name="twitter:image" content="https://www.ladderly.io/logo.png" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={preppendedTitle} />

        <meta
          name="description"
          content="Your tech adventure awaits! Ladderly helps you learn to code, land your first or next programming role, and grow your social and professional networks. Join our passionate community of learners and innovators. Discover tools and programs that accelerate your tech career, embrace open-source learning, and celebrate diversity and quality of life. Start your path to success with Ladderly today."
        />
        <meta
          name="keywords"
          content="Ladderly, learning, innovation, tech career, open source, community, education, programming, career development, diversity, personalized learning, high-performance lifestyle, tech tools, educational programs, coding, fullstack, full stack, full-stack, javascript, typescript, coding, software engineer, web development, react, nextjs, career, job, remote work, mentorship, mentor, tutorial"
        />
        <meta property="og:url" content="https://ladderly.io/" />
      </Head>

      {children}
    </>
  )
}

export default Layout

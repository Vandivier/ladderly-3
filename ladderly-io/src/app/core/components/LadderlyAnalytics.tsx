'use client'

import { GoogleAnalytics } from 'nextjs-google-analytics'
import { Analytics } from '@vercel/analytics/react'

export const LadderlyAnalytics = () => {
  return (
    <>
      <GoogleAnalytics trackPageViews />
      <Analytics />
    </>
  )
}

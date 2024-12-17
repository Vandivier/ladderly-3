// app/BlitzClientWrapper.tsx

'use client'

import { BlitzProvider } from '../../../app/blitz-client'
import { LadderlyAnalytics } from '../LadderlyAnalytics'

export default function BlitzClientWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <LadderlyAnalytics />
      <BlitzProvider>{children}</BlitzProvider>
    </>
  )
}

// app/BlitzClientWrapper.tsx

'use client'

import { BlitzProvider } from '../../../app/blitz-client'

export default function BlitzClientWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return <BlitzProvider>{children}</BlitzProvider>
}

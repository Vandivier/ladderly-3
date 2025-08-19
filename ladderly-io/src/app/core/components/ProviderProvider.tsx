'use client'

import { ThemeProvider } from '../theme/ThemeContext'
import { TRPCReactProvider } from '~/trpc/react'

export const ProviderProvider = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <TRPCReactProvider>
    <ThemeProvider>{children}</ThemeProvider>
  </TRPCReactProvider>
)

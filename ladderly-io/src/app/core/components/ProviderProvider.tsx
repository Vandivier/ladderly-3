'use client'

import { ThemeProvider } from '../theme/ThemeContext'
import { TRPCReactProvider } from '~/trpc/react'
import { EmailVerificationChecker } from './EmailVerificationChecker'

export const ProviderProvider = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <TRPCReactProvider>
    <ThemeProvider>
      {children}
      <EmailVerificationChecker />
    </ThemeProvider>
  </TRPCReactProvider>
)

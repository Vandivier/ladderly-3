'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '../theme/ThemeContext'
import { TRPCReactProvider } from '~/trpc/react'
import { EmailVerificationChecker } from './EmailVerificationChecker'

export const ProviderProvider = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <SessionProvider>
    <TRPCReactProvider>
      <ThemeProvider>
        {children}
        <EmailVerificationChecker />
      </ThemeProvider>
    </TRPCReactProvider>
  </SessionProvider>
)

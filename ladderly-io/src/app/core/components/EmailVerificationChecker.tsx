'use client'

import { useEffect, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { EmailVerificationModal } from './EmailVerificationModal'
import type { LadderlySession } from '~/server/auth'

export function EmailVerificationChecker() {
  const { data: session, status } = useSession()
  const ladderlySession = session as LadderlySession | null
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // Only show modal if user is authenticated and email is not verified
    if (
      status === 'authenticated' &&
      ladderlySession?.user &&
      !ladderlySession.user.emailVerified
    ) {
      setShowModal(true)
    } else {
      setShowModal(false)
    }
  }, [ladderlySession, status])

  // Don't show modal if already verified or no email
  if (
    !showModal ||
    !ladderlySession?.user?.email ||
    ladderlySession.user.emailVerified
  ) {
    return null
  }

  const handleClose = () => {
    // Force logout if user tries to close without verifying
    void signOut({
      callbackUrl: '/',
    })
  }

  return (
    <EmailVerificationModal
      email={ladderlySession.user.email}
      onClose={handleClose}
    />
  )
}

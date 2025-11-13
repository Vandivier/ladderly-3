'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { EmailVerificationModal } from './EmailVerificationModal'

export function EmailVerificationChecker() {
  const { data: session, status } = useSession()
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // Only show modal if user is authenticated and email is not verified
    if (
      status === 'authenticated' &&
      session?.user &&
      !session.user.emailVerified
    ) {
      setShowModal(true)
    } else {
      setShowModal(false)
    }
  }, [session, status])

  // Don't show modal if already verified or no email
  if (!showModal || !session?.user?.email || session.user.emailVerified) {
    return null
  }

  return (
    <EmailVerificationModal
      email={session.user.email}
      onClose={() => setShowModal(false)}
    />
  )
}

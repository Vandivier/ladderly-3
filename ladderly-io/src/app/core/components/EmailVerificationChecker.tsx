'use client'

import { useEffect, useState } from 'react'
import { signOut, useSession } from '~/server/auth-client'
import { EmailVerificationModal } from './EmailVerificationModal'

export function EmailVerificationChecker() {
  const { data: session } = useSession()
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // Only show modal if user is authenticated and email is not verified
    if (
      session?.user &&
      !session.user.emailVerified
    ) {
      setShowModal(true)
    } else {
      setShowModal(false)
    }
  }, [session])

  // Don't show modal if already verified or no email
  if (
    !showModal ||
    !session?.user?.email ||
    session.user.emailVerified
  ) {
    return null
  }

  const handleClose = async () => {
    // Force logout if user tries to close without verifying
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = '/'
        }
      }
    })
  }

  return (
    <EmailVerificationModal
      email={session.user.email}
      onClose={handleClose}
    />
  )
}

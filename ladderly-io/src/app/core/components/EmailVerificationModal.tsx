'use client'

import { useState } from 'react'
import { authClient } from '~/server/auth-client'

interface EmailVerificationModalProps {
  email: string
  onClose?: () => void
}

export function EmailVerificationModal({
  email,
  onClose,
}: EmailVerificationModalProps) {
  const [isSending, setIsSending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSendEmail = async () => {
    setIsSending(true)
    setError(null)
    setMessage(null)
    try {
      const { error } = await authClient.sendVerificationEmail({
        email,
        callbackURL: '/verify-email'
      })

      if (error) {
        setError(error.message ?? 'Failed to send verification email')
      } else {
        setMessage('Verification email sent! Please check your inbox.')
      }
    } catch {
      setError('Failed to send verification email')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold dark:text-white">
            Verify Your Email Address
          </h2>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>

        <div className="mb-4">
          <p className="text-gray-700 dark:text-gray-300">
            Please verify your email address ({email}) to access all site
            features.
          </p>
          <p className="mt-2 text-sm font-semibold text-red-600 dark:text-red-400">
            Warning: If you close this modal without verifying your email, you
            will be logged out and will need to sign in again.
          </p>
        </div>

        {message && (
          <div className="mb-4 rounded-lg bg-green-100 p-3 text-sm text-green-800 dark:bg-green-900 dark:text-green-200">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-800 dark:bg-red-900 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSendEmail}
            disabled={isSending}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSending ? 'Sending...' : 'Send Verification Email'}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

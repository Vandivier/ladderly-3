'use client'

import { LabeledTextField } from '~/app/core/components/LabeledTextField'
import { Form, FORM_ERROR } from '~/app/core/components/Form'
import { ResetPassword, PASSWORD_REQUIREMENTS } from 'src/app/(auth)/schemas'
import { authClient } from '~/server/auth-client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

const generateStrongPassword = (): string => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const special = '!@#$%^&*'
  const allChars = lowercase + uppercase + numbers + special

  // Ensure at least one of each required type
  let password = ''
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += special[Math.floor(Math.random() * special.length)]

  // Fill remaining 12 characters (16 total)
  for (let i = 0; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('')
}

const ResetPasswordClientPageClient = () => {
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')?.toString()
  const [isSuccess, setIsSuccess] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null,
  )
  const [copied, setCopied] = useState(false)

  const handleGeneratePassword = () => {
    const password = generateStrongPassword()
    setGeneratedPassword(password)
    setCopied(false)
  }

  const handleCopyPassword = async () => {
    if (generatedPassword) {
      await navigator.clipboard.writeText(generatedPassword)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <>
      {isSuccess ? (
        <div>
          <h2>Password Reset Successfully</h2>
          <p className="mt-4">
            <Link className="underline" href="/login">
              Log in now!
            </Link>
          </p>
          <p className="mt-4">
            Go to the{' '}
            <Link className="underline" href="/">
              homepage
            </Link>
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-3">
            <p className="mb-2 text-sm font-medium text-blue-800">
              Password Requirements:
            </p>
            <ul className="list-inside list-disc space-y-1 text-xs text-blue-700">
              {PASSWORD_REQUIREMENTS.map((req) => (
                <li key={req}>{req}</li>
              ))}
            </ul>
          </div>

          <div className="mb-4">
            <button
              type="button"
              onClick={handleGeneratePassword}
              className="rounded-md border border-ladderly-light-purple-1 bg-ladderly-violet-700 p-2 px-4 text-white"
            >
              🔐 Generate Strong Password
            </button>

            {generatedPassword && (
              <div className="mt-3 flex items-center gap-2">
                <code
                  className="flex-1 font-mono"
                  style={{
                    fontSize: '1rem',
                    padding: '.25rem .5rem',
                    borderRadius: '4px',
                    border: '1px solid purple',
                  }}
                >
                  {generatedPassword}
                </code>
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="rounded-full bg-gray-200 p-2 transition-colors hover:bg-gray-300"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <svg
                      className="h-5 w-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
                {copied && (
                  <span className="text-sm text-green-600">Copied!</span>
                )}
              </div>
            )}
          </div>

          <Form
            submitText="Reset Password"
            schema={ResetPassword}
            initialValues={{
              password: '',
              passwordConfirmation: '',
              token,
            }}
            onSubmit={async (values) => {
              try {
                if (!token) throw new Error('Token is required.')

                const { error } = await authClient.resetPassword({
                  newPassword: values.password,
                  token,
                })

                if (error) {
                  return {
                    [FORM_ERROR]: error.message ?? 'Failed to reset password',
                  }
                }

                setIsSuccess(true)
              } catch (error) {
                return {
                  [FORM_ERROR]:
                    error instanceof Error
                      ? error.message
                      : 'Sorry, we had an unexpected error. Please try again.',
                }
              }
            }}
          >
            <LabeledTextField
              name="password"
              label="New Password"
              type="password"
            />
            <LabeledTextField
              name="passwordConfirmation"
              label="Confirm New Password"
              type="password"
            />
          </Form>
        </>
      )}
    </>
  )
}

export default ResetPasswordClientPageClient

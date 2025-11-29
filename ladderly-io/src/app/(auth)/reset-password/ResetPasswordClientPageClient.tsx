'use client'

import { LabeledTextField } from '~/app/core/components/LabeledTextField'
import { Form, FORM_ERROR } from '~/app/core/components/Form'
import { ResetPassword, PASSWORD_REQUIREMENTS } from 'src/app/(auth)/schemas'
import { authClient } from '~/server/auth-client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

const ResetPasswordClientPageClient = () => {
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')?.toString()
  const [isSuccess, setIsSuccess] = useState(false)

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

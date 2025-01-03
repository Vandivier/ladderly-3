'use client'

import { LabeledTextField } from '~/app/core/components/LabeledTextField'
import { Form, FORM_ERROR } from '~/app/core/components/Form'
import { ResetPassword } from 'src/app/(auth)/schemas'
import { api } from '~/trpc/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const ResetPasswordClientPageClient = () => {
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')?.toString()
  const resetPasswordMutation = api.auth.resetPassword.useMutation()

  return (
    <>
      {resetPasswordMutation.isSuccess ? (
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
              await resetPasswordMutation.mutateAsync({
                ...values,
                token,
              })
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
      )}
    </>
  )
}

export default ResetPasswordClientPageClient

'use client'

import { useState } from 'react'

import { LabeledTextField } from '~/app/core/components/LabeledTextField'
import { Form, FORM_ERROR } from '~/app/core/components/Form'
import { ForgotPassword } from 'src/app/(auth)/schemas'
import { authClient } from '~/server/auth-client'
import Link from 'next/link'

const ForgotPasswordPage = () => {
  const [isSuccess, setIsSuccess] = useState(false)

  return (
    <div className="relative min-h-screen">
      <nav className="border-ladderly-light-purple flex border bg-ladderly-off-white px-4 py-1 text-ladderly-violet-700">
        <Link
          href="/"
          className="ml-auto text-gray-800 hover:text-ladderly-pink"
        >
          Back to Home
        </Link>
      </nav>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="m-2 w-full max-w-md rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-4 text-2xl font-bold text-gray-800">
            Reset Your Password
          </h1>

          {isSuccess ? (
            <div>
              <h2>Request Submitted</h2>
              <p>
                If your email is in our system, you will receive instructions to
                reset your password shortly.
              </p>
            </div>
          ) : (
            <Form
              submitText="Send Reset Password Instructions"
              schema={ForgotPassword}
              initialValues={{ email: '' }}
              onSubmit={async (values) => {
                try {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                  const { error } = await (authClient as any).forgotPassword({
                    email: values.email,
                    redirectTo: '/reset-password',
                  })

                  if (error) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
                    return { [FORM_ERROR]: error.message ?? 'Failed to send reset email' }
                  }

                  setIsSuccess(true)
                } catch {
                  return {
                    [FORM_ERROR]: 'Sorry, we had an unexpected error. Please try again.',
                  }
                }
              }}
            >
              <LabeledTextField
                name="email"
                label="Email"
                placeholder="Email"
                type="email"
              />
            </Form>
          )}

          <section className="mt-8 flex flex-col gap-2">
            <h2 className="font-bold">No need to reset your password?</h2>
            <div className="my-1">
              <Link className="underline" href="/login">
                Log in here
              </Link>
            </div>
            <div className="my-1">
              <Link className="underline" href="/signup">
                Sign up here
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage

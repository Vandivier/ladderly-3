'use client'

import { FORM_ERROR } from 'final-form'
import Link from 'next/link'
import NextImage from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Login as LoginSchema } from '~/app/(auth)/schemas'
import { Form } from '~/app/core/components/Form'
import { LabeledTextField } from '~/app/core/components/LabeledTextField'
import { signIn, useSession } from '~/server/auth-client'

export const LoginForm = () => {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)

  // Redirect once session is available after successful login
  useEffect(() => {
    if (loginSuccess && session?.user) {
      router.push('/?refresh_current_user=true')
      router.refresh()
    }
  }, [loginSuccess, session, router])

  const handleSubmit = async (values: { email: string; password: string }) => {
    setIsLoggingIn(true)
    setLoginSuccess(false)

    const { data, error } = await signIn.email({
      email: values.email,
      password: values.password,
    })

    if (error) {
      setIsLoggingIn(false)
      return { [FORM_ERROR]: error.message ?? 'An error occurred' }
    }

    if (data) {
      setLoginSuccess(true)
      // Session will be updated via useSession hook
    }
  }

  if (isLoggingIn || loginSuccess) {
    return (
      <div className="m-2 w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-4 text-2xl font-bold text-gray-800">Logging in...</h1>
        <p className="text-gray-600">Please wait while we sign you in.</p>
      </div>
    )
  }

  return (
    <div className="m-2 w-full max-w-md rounded-lg bg-white p-8 shadow-md">
      <h1 className="mb-4 text-2xl font-bold text-gray-800">Log In</h1>

      <button
        onClick={() => signIn.social({ provider: 'google', callbackURL: '/' })}
        className="mb-6 flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50"
      >
        <NextImage
          src="https://www.google.com/favicon.ico"
          alt="Google"
          width={20}
          height={20}
          className="size-5"
        />
        Sign in with Google
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">Or continue with</span>
        </div>
      </div>

      <Form
        className="space-y-4"
        submitText="Log In with Email"
        schema={LoginSchema}
        initialValues={{ email: '', password: '' }}
        onSubmit={handleSubmit}
      >
        <LabeledTextField name="email" label="Email" placeholder="Email" />
        <LabeledTextField
          name="password"
          label="Password"
          placeholder="Password"
          type="password"

        />
        <div className="mt-4 text-left">
          <Link className="underline" href="/forgot-password">
            Reset Your Password
          </Link>
        </div>
      </Form>

      <div className="mt-4">
        Need to create an account?{' '}
        <Link className="underline" href="/signup">
          Sign up here!
        </Link>
      </div>
    </div>
  )
}

'use client'

import { FORM_ERROR } from 'final-form'
import Link from 'next/link'
import NextImage from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Signup as SignupSchema } from '~/app/(auth)/schemas'
import { Form } from '~/app/core/components/Form'
import { LabeledTextField } from '~/app/core/components/LabeledTextField'
import { authClient, signIn, useSession } from '~/server/auth-client'

type SignupFormProps = {
  onSuccess?: () => void
}

export const SignupForm = (props: SignupFormProps) => {
  const router = useRouter()
  const { data: session } = useSession()
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)

  // Redirect once session is available after successful signup/login
  useEffect(() => {
    if (signupSuccess && session?.user) {
      props.onSuccess?.()
      router.push('/?refresh_current_user=true')
      router.refresh()
    }
  }, [signupSuccess, session, router, props])

  const handleSubmit = async (values: { email: string; password: string }) => {
    setIsSigningUp(true)
    setSignupSuccess(false)

    try {
      const { data, error } = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: values.email.split('@')[0] ?? 'User', // Default name from email
      })

      if (error) {
        setIsSigningUp(false)
        if (error.message?.includes('already exists')) {
          return { email: 'This email is already being used' }
        }
        return { [FORM_ERROR]: error.message ?? 'Something went wrong!' }
      }

      if (data) {
        setSignupSuccess(true)
        // Session will be updated via useSession hook
      }
    } catch {
      setIsSigningUp(false)
      return { [FORM_ERROR]: 'Something went wrong!' }
    }
  }

  if (isSigningUp || signupSuccess) {
    return (
      <div className="m-2 w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-4 text-2xl font-bold text-gray-800">
          Creating your account...
        </h1>
        <p className="text-gray-600">
          Please wait while we set up your account.
        </p>
      </div>
    )
  }

  return (
    <div className="m-2 w-full max-w-md rounded-lg bg-white p-8 shadow-md">
      <h1 className="mb-4 text-2xl font-bold text-gray-800">
        Create an Account
      </h1>

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
        Sign up with Google
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
        submitText="Create Account"
        schema={SignupSchema}
        initialValues={{ email: '', password: '' }}
        className="space-y-4"
        onSubmit={handleSubmit}
      >
        <LabeledTextField name="email" label="Email" placeholder="Email" />
        <LabeledTextField
          name="password"
          label="Password"
          placeholder="Password"
          type="password"
        />
      </Form>

      <div className="mt-4">
        Already have an account?{' '}
        <Link className="underline" href="/login">
          Log in here!
        </Link>
      </div>
    </div>
  )
}

export default SignupForm

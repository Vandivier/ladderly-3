'use client'

import { useMutation } from '@blitzjs/rpc'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { SignInButtonGoogle } from 'src/app/(auth)/components/SignInButtonGoogle'
import signup from 'src/app/(auth)/mutations/signup'
import { Signup } from 'src/app/(auth)/schemas'
import { Form, FORM_ERROR } from 'src/core/components/Form'
import { LabeledTextField } from 'src/core/components/LabeledTextField'

type SignupFormProps = {
  onSuccess?: () => void
}

export const SignupForm = (props: SignupFormProps) => {
  const [signupMutation] = useMutation(signup)

  const handleGoogleSignIn = async () => {
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  const handleKeyUp = async (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter') {
      await handleGoogleSignIn()
    }
  }

  return (
    <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
      <h1 className="mb-4 text-2xl font-bold text-gray-800">
        Create an Account
      </h1>

      <section id="social-sign-in" className="my-4">
        <SignInButtonGoogle
          onClick={handleGoogleSignIn}
          onKeyUp={handleKeyUp}
        />
      </section>

      <Form
        submitText="Create Account"
        schema={Signup}
        initialValues={{ email: '', password: '' }}
        className="space-y-4"
        onSubmit={async (values) => {
          try {
            await signupMutation(values)
            props.onSuccess?.()
          } catch (error: any) {
            if (
              error.code === 'P2002' &&
              error.meta?.target?.includes('email')
            ) {
              // This error comes from Prisma
              return { email: 'This email is already being used' }
            } else {
              return { [FORM_ERROR]: error.toString() }
            }
          }
        }}
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
        Already signed up?{' '}
        <Link className="underline" href="/login">
          Log in here!
        </Link>
      </div>
    </div>
  )
}

export default SignupForm

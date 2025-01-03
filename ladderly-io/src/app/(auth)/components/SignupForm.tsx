'use client'

import { FORM_ERROR } from 'final-form'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Signup as SignupSchema } from '~/app/(auth)/schemas'
import { Form } from '~/app/core/components/Form'
import { LabeledTextField } from '~/app/core/components/LabeledTextField'
import { api } from '~/trpc/react'

type SignupFormProps = {
  onSuccess?: () => void
}

export const SignupForm = (props: SignupFormProps) => {
  const router = useRouter()
  const signupMutation = api.auth.signup.useMutation()

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      // Create user account using auth router mutation
      await signupMutation.mutateAsync(values)

      // If account creation is successful, sign in the user
      const result = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
      })

      if (result?.error) {
        return { [FORM_ERROR]: result.error }
      }

      if (result?.ok) {
        props.onSuccess?.()
        router.push('/?refresh_current_user=true')
        router.refresh()
      }
    } catch (error: any) {
      if (error.message === 'User already exists') {
        return { email: 'This email is already being used' }
      }
      return { [FORM_ERROR]: error.message || 'Something went wrong!' }
    }
  }

  return (
    <div className="m-2 w-full max-w-md rounded-lg bg-white p-8 shadow-md">
      <h1 className="mb-4 text-2xl font-bold text-gray-800">
        Create an Account
      </h1>

      <button
        onClick={() => signIn('google', { callbackUrl: '/' })}
        className="mb-6 flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50"
      >
        <img
          src="https://www.google.com/favicon.ico"
          alt="Google"
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

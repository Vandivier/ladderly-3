import Link from 'next/link'
import { SignupForm } from '~/app/(auth)/components/SignupForm'
import { auth } from '~/server/better-auth'
import { headers } from 'next/headers'

export const metadata = {
  title: 'Create Account',
}

const CreateAccountPage = async () => {
  const session = await auth.api.getSession({
    headers: headers(),
  })

  return (
    <div className="relative min-h-screen">
      <nav className="flex border border-ladderly-light-purple-1 bg-ladderly-off-white px-4 py-1 text-ladderly-violet-700">
        <Link
          href="/"
          className="ml-auto text-gray-800 hover:text-ladderly-pink"
        >
          Back to Home
        </Link>
      </nav>
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
        {session?.user ? (
          <p>You are already logged in.</p>
        ) : (
          <>
            <SignupForm />
            <p className="mt-4 text-sm text-gray-600">
              By signing up, you agree to our{' '}
              <Link href="/privacy-policy" className="underline">
                Terms of Service
              </Link>
              .
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default CreateAccountPage

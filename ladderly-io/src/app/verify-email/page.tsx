import { auth } from '~/server/better-auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { token?: string }
}) {
  const session = await auth.api.getSession({
    headers: headers(),
  })

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.emailVerified) {
    redirect('/')
  }

  if (!searchParams.token) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-bold">Email Verification</h1>
        <p className="text-gray-700 dark:text-gray-300">
          Please check your email for the verification link.
        </p>
      </div>
    )
  }

  try {
    await auth.api.verifyEmail({
      query: {
        token: searchParams.token
      },
      headers: headers()
    })
  } catch (error) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-bold">Email Verification Failed</h1>
        <p className="text-red-600 dark:text-red-400">
          {error instanceof Error
            ? error.message
            : 'Invalid or expired verification token. Please request a new verification email.'}
        </p>
      </div>
    )
  }

  return redirect('/?verified=true')
}

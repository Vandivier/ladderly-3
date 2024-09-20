'use client'
import { BlitzPage } from '@blitzjs/next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SignupForm } from 'src/app/(auth)/components/SignupForm'
import Layout from 'src/core/layouts/Layout'

const CreateAccountPage: BlitzPage = () => {
  const router = useRouter()

  return (
    <Layout title="Create Account">
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
          <SignupForm onSuccess={() => router.push('/')} />
        </div>
      </div>
    </Layout>
  )
}

export default CreateAccountPage

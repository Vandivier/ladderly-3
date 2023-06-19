import { useRouter } from "next/router"
import Layout from "src/core/layouts/Layout"
import { SignupForm } from "src/auth/components/SignupForm"
import { BlitzPage, Routes } from "@blitzjs/next"
import Link from "next/link"

const SignupPage: BlitzPage = () => {
  const router = useRouter()

  return (
    <Layout title="Sign Up">
      <div className="relative min-h-screen">
        <nav className="bg-ladderly-off-white border border-ladderly-light-purple text-ladderly-teal flex py-1 px-4">
          <Link href={Routes.Home()} className="ml-auto text-gray-800 hover:text-ladderly-pink">
            Back to Home
          </Link>
        </nav>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <SignupForm onSuccess={() => router.push(Routes.Home())} />
        </div>
      </div>
    </Layout>
  )
}

export default SignupPage

import { useRouter } from "next/router"
import Layout from "src/core/layouts/Layout"
import { LoginForm } from "src/auth/components/LoginForm"
import { BlitzPage, Routes } from "@blitzjs/next"
import Link from "next/link"

const LoginPage: BlitzPage = () => {
  const router = useRouter()

  return (
    <Layout title="Log In">
      <div className="relative min-h-screen">
        <nav className="flex border border-ladderly-light-purple-1 bg-ladderly-off-white px-4 py-1 text-ladderly-violet-700">
          <Link
            href="/"
            className="ml-auto text-gray-800 hover:text-ladderly-pink"
          >
            Back to Home
          </Link>
        </nav>
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <LoginForm onSuccess={() => router.push("/")} />
        </div>
      </div>
    </Layout>
  )
}

export default LoginPage

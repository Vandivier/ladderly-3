import { useRouter } from "next/router"
import Layout from "src/core/layouts/Layout"
import { LabeledTextField } from "src/core/components/LabeledTextField"
import { Form, FORM_ERROR } from "src/core/components/Form"
import { ForgotPassword } from "src/auth/schemas"
import forgotPassword from "src/auth/mutations/forgotPassword"
import { useMutation } from "@blitzjs/rpc"
import { BlitzPage, Routes } from "@blitzjs/next"
import Link from "next/link"

const ForgotPasswordPage: BlitzPage = () => {
  const [forgotPasswordMutation, { isSuccess }] = useMutation(forgotPassword)
  const router = useRouter()

  return (
    <Layout title="Forgot Your Password?">
      <div className="relative min-h-screen">
        <nav className="bg-ladderly-off-white border border-ladderly-light-purple text-ladderly-teal flex py-1 px-4">
          <Link href={Routes.Home()} className="ml-auto text-gray-800 hover:text-ladderly-pink">
            Back to Home
          </Link>
        </nav>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-gray-800 font-bold text-2xl mb-4">Forgot your password?</h1>

            {isSuccess ? (
              <div>
                <h2>Request Submitted</h2>
                <p>
                  If your email is in our system, you will receive instructions to reset your
                  password shortly.
                </p>
              </div>
            ) : (
              <Form
                submitText="Send Reset Password Instructions"
                schema={ForgotPassword}
                initialValues={{ email: "" }}
                onSubmit={async (values) => {
                  try {
                    await forgotPasswordMutation(values)
                  } catch (error: any) {
                    return {
                      [FORM_ERROR]: "Sorry, we had an unexpected error. Please try again.",
                    }
                  }
                }}
              >
                <LabeledTextField name="email" label="Email" placeholder="Email" />
              </Form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ForgotPasswordPage

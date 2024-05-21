import { BlitzPage } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { assert } from "blitz"
import Link from "next/link"
import { useRouter } from "next/router"
import resetPassword from "src/app/(auth)/mutations/resetPassword"
import { ResetPassword } from "src/app/(auth)/schemas"
import { Form, FORM_ERROR } from "src/core/components/Form"
import { LabeledTextField } from "src/core/components/LabeledTextField"
import Layout from "src/core/layouts/Layout"

const ResetPasswordPage: BlitzPage = () => {
  const router = useRouter()
  const token = router.query.token?.toString()
  const [resetPasswordMutation, { isSuccess }] = useMutation(resetPassword)

  return (
    <Layout title="Set a New Password">
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
          <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
            <h1 className="mb-4 text-2xl font-bold text-gray-800">
              Set a New Password
            </h1>

            {isSuccess ? (
              <div>
                <h2>Password Reset Successfully</h2>
                <p>
                  Go to the <Link href="/">homepage</Link>
                </p>
              </div>
            ) : (
              <Form
                submitText="Reset Password"
                schema={ResetPassword}
                initialValues={{
                  password: "",
                  passwordConfirmation: "",
                  token,
                }}
                onSubmit={async (values) => {
                  try {
                    assert(token, "token is required.")
                    await resetPasswordMutation({ ...values, token })
                  } catch (error: any) {
                    if (error.name === "ResetPasswordError") {
                      return {
                        [FORM_ERROR]: error.message,
                      }
                    } else {
                      return {
                        [FORM_ERROR]:
                          "Sorry, we had an unexpected error. Please try again.",
                      }
                    }
                  }
                }}
              >
                <LabeledTextField
                  name="password"
                  label="New Password"
                  type="password"
                />
                <LabeledTextField
                  name="passwordConfirmation"
                  label="Confirm New Password"
                  type="password"
                />
              </Form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

ResetPasswordPage.redirectAuthenticatedTo = "/"
ResetPasswordPage.getLayout = (page) => (
  <Layout title="Reset Your Password">{page}</Layout>
)

export default ResetPasswordPage

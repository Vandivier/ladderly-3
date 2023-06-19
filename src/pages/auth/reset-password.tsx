import { useRouter } from "next/router"
import Layout from "src/core/layouts/Layout"
import { LabeledTextField } from "src/core/components/LabeledTextField"
import { Form, FORM_ERROR } from "src/core/components/Form"
import { ResetPassword } from "src/auth/schemas"
import resetPassword from "src/auth/mutations/resetPassword"
import { BlitzPage, Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import Link from "next/link"
import { assert } from "blitz"

const ResetPasswordPage: BlitzPage = () => {
  const router = useRouter()
  const token = router.query.token?.toString()
  const [resetPasswordMutation, { isSuccess }] = useMutation(resetPassword)

  return (
    <Layout title="Set a New Password">
      <div className="relative min-h-screen">
        <nav className="bg-ladderly-off-white border border-ladderly-light-purple text-ladderly-teal flex py-1 px-4">
          <Link href={Routes.Home()} className="ml-auto text-gray-800 hover:text-ladderly-pink">
            Back to Home
          </Link>
        </nav>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-gray-800 font-bold text-2xl mb-4">Set a New Password</h1>

            {isSuccess ? (
              <div>
                <h2>Password Reset Successfully</h2>
                <p>
                  Go to the <Link href={Routes.Home()}>homepage</Link>
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
                        [FORM_ERROR]: "Sorry, we had an unexpected error. Please try again.",
                      }
                    }
                  }
                }}
              >
                <LabeledTextField name="password" label="New Password" type="password" />
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
ResetPasswordPage.getLayout = (page) => <Layout title="Reset Your Password">{page}</Layout>

export default ResetPasswordPage

import { useMutation } from "@blitzjs/rpc"
import { AuthenticationError, PromiseReturnType } from "blitz"
import Link from "next/link"
import login from "src/app/(auth)/mutations/login"
import { Login } from "src/app/(auth)/schemas"
import { FORM_ERROR, Form } from "src/core/components/Form"
import { LabeledTextField } from "src/core/components/LabeledTextField"




type LoginFormProps = {
  onSuccess?: (user: PromiseReturnType<typeof login>) => void
}

export const LoginForm = (props: LoginFormProps) => {
  const [loginMutation] = useMutation(login)
  return (
    <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
      <h1 className="mb-4 text-2xl font-bold text-gray-800">Log In</h1>

      <Form
        submitText="Log In"
        schema={Login}
        initialValues={{ email: "", password: "" }}
        onSubmit={async (values) => {
          try {
            const user = await loginMutation(values)
            props.onSuccess?.(user)
          } catch (error: any) {
            if (error instanceof AuthenticationError) {
              return { [FORM_ERROR]: "Sorry, those credentials are invalid" }
            } else {
              return {
                [FORM_ERROR]:
                  "Sorry, we had an unexpected error. Please try again. - " +
                  error.toString(),
              }
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
        <div className="mt-4 text-left">
          <Link href="/forgot-password">Forgot your password?</Link>
        </div>
      </Form>

      <div className="mt-4">
        Or <Link href="/signup" className="underline">Sign Up</Link>
      </div>
    </div>
  )
}

export default LoginForm

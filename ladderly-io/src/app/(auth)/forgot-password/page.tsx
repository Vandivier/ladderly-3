"use client";

import { LabeledTextField } from "~/app/core/components/LabeledTextField";
import { Form, FORM_ERROR } from "~/app/core/components/Form";
import { ForgotPassword } from "src/app/(auth)/schemas";
// import forgotPassword from "src/app/(auth)/mutations/forgotPassword";
// import { useMutation } from "@blitzjs/rpc";
import Link from "next/link";

const ForgotPasswordPage = () => {
  // const [forgotPasswordMutation, { isSuccess }] = useMutation(forgotPassword);
  const isSuccess = false;

  return (
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
            Forgot your password?
          </h1>

          {isSuccess ? (
            <div>
              <h2>Request Submitted</h2>
              <p>
                If your email is in our system, you will receive instructions to
                reset your password shortly.
              </p>
            </div>
          ) : (
            <Form
              submitText="Send Reset Password Instructions"
              schema={ForgotPassword}
              initialValues={{ email: "" }}
              onSubmit={async (values) => {
                try {
                  // await forgotPasswordMutation(values);
                } catch (error: any) {
                  return {
                    [FORM_ERROR]:
                      "Sorry, we had an unexpected error. Please try again.",
                  };
                }
              }}
            >
              <LabeledTextField
                name="email"
                label="Email"
                placeholder="Email"
              />
            </Form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

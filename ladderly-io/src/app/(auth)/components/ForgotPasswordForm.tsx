"use client";

import { Form, FORM_ERROR } from "~/app/core/components/Form";
import LabeledTextField from "~/app/core/components/LabeledTextField";
import { ForgotPassword } from "../schemas";
import { api } from "~/trpc/react";

type ForgotPasswordValues = {
  email: string;
};

export function ForgotPasswordForm() {
  const forgotPasswordMutation = api.auth.forgotPassword.useMutation();

  return (
    <>
      <h1>Reset Your Password</h1>
      <>
        {forgotPasswordMutation.isSuccess ? (
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
            onSubmit={async (values: ForgotPasswordValues) => {
              try {
                if (!values.email) {
                  throw new Error("Email is required.");
                }
                await forgotPasswordMutation.mutateAsync(values);
              } catch (error: any) {
                return {
                  [FORM_ERROR]:
                    error instanceof Error
                      ? error.message
                      : "Sorry, we had an unexpected error. Please try again.",
                };
              }
            }}
          >
            <LabeledTextField name="email" label="Email" placeholder="Email" type="email" />
          </Form>
        )}
      </>
    </>
  );
}

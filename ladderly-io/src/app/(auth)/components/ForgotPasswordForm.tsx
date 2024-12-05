"use client";

import { Form, FORM_ERROR } from "~/app/core/components/Form";
import LabeledTextField from "~/app/core/components/LabeledTextField";
import { ForgotPassword } from "../schemas";
import { api } from "~/trpc/react";

export function ForgotPasswordForm() {
  const forgotPasswordMutation = api.auth.forgotPassword.useMutation();

  return (
    <>
      <h1>Forgot your password?</h1>
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
            onSubmit={async (values: any) => {
              try {
                await forgotPasswordMutation.mutateAsync(values);
              } catch (error: any) {
                return {
                  [FORM_ERROR]:
                    "Sorry, we had an unexpected error. Please try again.",
                };
              }
            }}
          >
            <LabeledTextField name="email" label="Email" placeholder="Email" />
          </Form>
        )}
      </>
    </>
  );
}

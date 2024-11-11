"use client";

import { FORM_ERROR } from "final-form";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Login as LoginSchema } from "~/app/(auth)/schemas";
import { SocialSignIn } from "~/app/_components/SocialSignIn";
import { Form } from "~/app/core/components/Form";
import { LabeledTextField } from "~/app/core/components/LabeledTextField";
import { LadderlySession } from "~/server/auth";

export const LoginForm = ({ session }: { session: LadderlySession | null }) => {
  const router = useRouter();

  return (
    <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
      <h1 className="mb-4 text-2xl font-bold text-gray-800">Log In</h1>

      <SocialSignIn initialSession={session} />

      <Form
        className="space-y-4"
        submitText="Log In"
        schema={LoginSchema}
        initialValues={{ email: "", password: "" }}
        onSubmit={async (values) => {
          try {
            const result = await signIn("credentials", {
              email: values.email,
              password: values.password,
              redirect: false,
            });

            if (result?.error) {
              return { [FORM_ERROR]: "Invalid email or password" };
            }

            if (result?.ok) {
              router.push("/");
              router.refresh();
            }
          } catch (error: any) {
            return {
              [FORM_ERROR]: "An unexpected error occurred. Please try again.",
            };
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
          <Link className="underline" href="/forgot-password">
            Forgot your password?
          </Link>
        </div>
      </Form>

      <div className="mt-4">
        Need to create an account?{" "}
        <Link className="underline" href="/signup">
          Sign up here!
        </Link>
      </div>
    </div>
  );
};

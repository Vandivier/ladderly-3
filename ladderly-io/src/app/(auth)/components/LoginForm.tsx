"use client";

import { FORM_ERROR } from "final-form";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Login as LoginSchema } from "~/app/(auth)/schemas";
import { Form } from "~/app/core/components/Form";
import { LabeledTextField } from "~/app/core/components/LabeledTextField";

export const LoginForm = () => {
  const router = useRouter();

  return (
    <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
      <h1 className="mb-4 text-2xl font-bold text-gray-800">Log In</h1>

      <button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="mb-6 flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50"
      >
        <img
          src="https://www.google.com/favicon.ico"
          alt="Google"
          className="h-5 w-5"
        />
        Sign in with Google
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">Or continue with</span>
        </div>
      </div>

      <Form
        className="space-y-4"
        submitText="Log In with Email"
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

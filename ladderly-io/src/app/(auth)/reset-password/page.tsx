import { Metadata } from "next";
import ResetPasswordClientPageClient from "./ResetPasswordClientPageClient";

export const metadata: Metadata = {
  title: "Reset Password",
};

const ResetPasswordPage = () => {
  return (
    <div className="relative min-h-screen">
      <nav className="border-ladderly-light-purple flex border bg-ladderly-off-white px-4 py-1 text-ladderly-violet-700">
        <a href="/" className="ml-auto text-gray-800 hover:text-ladderly-pink">
          Back to Home
        </a>
      </nav>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-4 text-2xl font-bold text-gray-800">
            Set a New Password
          </h1>
          <ResetPasswordClientPageClient />
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

import Link from "next/link";
import { SignupForm } from "~/app/(auth)/components/SignupForm";
import { getServerAuthSession, LadderlySession } from "~/server/auth";

export const metadata = {
  title: "Create Account",
};

const CreateAccountPage = async () => {
  const session: LadderlySession | null = await getServerAuthSession();

  return (
    <div className="relative min-h-screen">
      <nav className="flex border border-ladderly-light-purple-1 bg-ladderly-off-white px-4 py-1 text-ladderly-violet-700">
        <Link
          href="/"
          className="ml-auto text-gray-800 hover:text-ladderly-pink"
        >
          Back to Home
        </Link>
      </nav>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        {session?.user ? <p>You are already logged in.</p> : <SignupForm />}
      </div>
    </div>
  );
};

export default CreateAccountPage;

import Link from "next/link";
import { LoginForm } from "~/app/(auth)/components/LoginForm";
import { getServerAuthSession } from "~/server/auth";
import { LadderlySession } from "~/server/auth";

export const metadata = {
  title: "Log In",
};

const LoginPage = async () => {
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
        {session?.user ? <p>You are already logged in.</p> : <LoginForm />}
      </div>
    </div>
  );
};

export default LoginPage;

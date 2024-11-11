// import { redirect } from "next/navigation";
import Link from "next/link";
import LoginForm from "src/app/(auth)/components/LoginForm";
// import Layout from 'src/core/layouts/Layout'

export const metadata = {
  title: "Log In",
};

const LoginPage = () => {
  // const router = useRouter();

  return (
    // <Layout title="Log In">
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
        <LoginForm />
      </div>
    </div>
    // </Layout>
  );
};

export default LoginPage;

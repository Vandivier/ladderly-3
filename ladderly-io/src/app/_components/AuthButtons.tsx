"use client";

import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AuthButtons({ initialSession }: { initialSession: any }) {
  const [session, setSession] = useState(initialSession);
  const router = useRouter();

  const handleSignIn = async () => {
    await signIn(undefined, { callbackUrl: "/" });
  };

  const handleSignOut = async () => {
    const data = await signOut({ redirect: false, callbackUrl: "/" });
    setSession(null);
    router.push(data.url);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {session && <span>Logged in as {session.user?.name}</span>}
      </p>
      <button
        onClick={session ? handleSignOut : handleSignIn}
        className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
      >
        {session ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
}

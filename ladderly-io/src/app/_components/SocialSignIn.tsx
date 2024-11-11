"use client";

import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LadderlySession } from "~/server/auth";

export function SocialSignIn({
  initialSession,
}: {
  initialSession: LadderlySession | null;
}) {
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
    <button
      onClick={session ? handleSignOut : handleSignIn}
      className="rounded-full bg-gray-200 px-10 p-2 my-2 font-semibold no-underline transition hover:bg-gray-800 hover:text-white"
    >
      {session ? "Sign out" : "Social Sign in"}
    </button>
  );
}

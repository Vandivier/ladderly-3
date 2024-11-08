import { Suspense } from "react";
import HomePageContent from "./home/HomePageContent";
import HomePageSkeleton from "./home/HomePageSkeleton";

import { getServerAuthSession } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function HomePage() {
  // TODO: replace hello with subscription level
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await getServerAuthSession();

  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageContent hello={hello} session={session} />
    </Suspense>
  );
}

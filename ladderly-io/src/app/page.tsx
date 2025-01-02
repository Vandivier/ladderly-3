import { Suspense } from "react";
import { getServerAuthSession, type LadderlySession } from "~/server/auth";
import HomePageContent from "./home/HomePageContent";
import HomePageSkeleton from "./home/HomePageSkeleton";

export const metadata = {
  title: "Home",
};

export default async function HomePage() {
  const session: LadderlySession | null = await getServerAuthSession();

  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageContent session={session} />
    </Suspense>
  );
}

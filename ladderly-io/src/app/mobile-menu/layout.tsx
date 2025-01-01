import { getServerAuthSession } from "~/server/auth";
import MobileMenuPage from "./page";

export default async function MobileMenuLayout() {
  const session = await getServerAuthSession();

  return <MobileMenuPage session={session} />;
}

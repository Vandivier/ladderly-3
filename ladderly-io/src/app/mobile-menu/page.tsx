import { getServerAuthSession } from "~/server/auth";
import { MobileMenuContent } from "./MobileMenuContent";

export default async function MobileMenuPage() {
  const session = await getServerAuthSession();
  return <MobileMenuContent session={session} />;
}

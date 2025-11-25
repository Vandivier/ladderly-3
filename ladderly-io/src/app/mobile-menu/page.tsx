import { auth, type LadderlyServerSession } from '~/server/better-auth'
import { headers } from 'next/headers'
import MobileMenuContent from './MobileMenuContent'

export default async function MobileMenuPage() {
  const session = await auth.api.getSession({
    headers: headers(),
  }) as LadderlyServerSession
  return <MobileMenuContent session={session} />;
}

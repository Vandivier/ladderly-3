import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { auth, type LadderlyServerSession } from '~/server/better-auth'
import { headers } from 'next/headers'
import HomePageContent from './home/HomePageContent'
import HomePageSkeleton from './home/HomePageSkeleton'

export const metadata = {
  title: 'Home',
}

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: headers(),
  }) as LadderlyServerSession

  if (session?.user) {
    redirect('/journal')
  }

  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageContent session={session} />
    </Suspense>
  )
}

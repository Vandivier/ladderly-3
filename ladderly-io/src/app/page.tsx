import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerAuthSession, type LadderlySession } from '~/server/auth'
import HomePageContent from './home/HomePageContent'
import HomePageSkeleton from './home/HomePageSkeleton'

export const metadata = {
  title: 'Home',
}

export default async function HomePage() {
  const session: LadderlySession | null = await getServerAuthSession()

  if (session?.user) {
    redirect('/journal')
  }

  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageContent session={session} />
    </Suspense>
  )
}

import { Suspense } from 'react'
import HomePageContent from './home/HomePageContent'
import HomePageSkeleton from './home/HomePageSkeleton'

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageContent />
    </Suspense>
  )
}

import { Suspense } from 'react'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import PublicJournalFeed from './PublicJournalFeed'

export const metadata = {
  title: 'Journal Feed',
  description: 'Public career journal entries from the Ladderly community',
  alternates: {
    canonical: '/journal/feed',
  },
}

export default async function JournalFeedPage() {
  return (
    <LadderlyPageWrapper>
      <div className="container mx-auto max-w-6xl px-4 py-2">
        <h1 className="mb-2 text-3xl font-bold">Career Journal Feed</h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Public career journal entries shared by the Ladderly community. Get inspired and learn from others' experiences.
        </p>

        <Suspense fallback={<div>Loading public journal entries...</div>}>
          <PublicJournalFeed />
        </Suspense>
      </div>
    </LadderlyPageWrapper>
  )
}

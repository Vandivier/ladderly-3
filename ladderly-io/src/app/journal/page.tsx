// src/app/journal/page.tsx

import { Suspense } from 'react'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import CreateJournalEntryForm from './CreateJournalEntryForm'
import JournalEntryList from './JournalEntryList'
import ReminderSettings from './ReminderSettings'
import PracticeSection from './PracticeSection'
import StoryGenerator from './StoryGenerator'
import { DeepJournalingWaitlist } from './DeepJournalingWaitlist'
import { getServerAuthSession } from '~/server/auth'
import Link from 'next/link'

export const metadata = {
  title: 'Journal',
  alternates: {
    canonical: '/journal',
  },
}

export default async function JournalPage() {
  const session = await getServerAuthSession()
  const userTier = session?.user?.subscription?.tier

  if (!userTier) {
    return (
      <LadderlyPageWrapper authenticate>
        <div className="container mx-auto max-w-6xl px-4 py-2">
          <h1 className="mb-2 text-3xl font-bold">Career Journal</h1>
        </div>
      </LadderlyPageWrapper>
    )
  }

  return (
    <LadderlyPageWrapper authenticate>
      <div className="container mx-auto max-w-6xl px-4 py-2">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Career Journal</h1>
          <Link
            href="/journal/feed"
            className="rounded bg-blue-50 px-3 py-1 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-800/30"
          >
            View Community Feed
          </Link>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1">
            <Suspense fallback={<div>Loading form...</div>}>
              <CreateJournalEntryForm userTier={userTier} />
            </Suspense>

            <Suspense fallback={<div>Loading journal entries...</div>}>
              <JournalEntryList />
            </Suspense>
          </div>

          {/* Right sidebar - utilities */}
          <div className="w-full space-y-6 lg:w-80">
            <Suspense fallback={<div>Loading reminders...</div>}>
              <ReminderSettings />
            </Suspense>

            <Suspense fallback={<div>Loading practice section...</div>}>
              <PracticeSection />
            </Suspense>

            <Suspense fallback={<div>Loading story generator...</div>}>
              <StoryGenerator />
            </Suspense>

            {/* Premium feature teaser */}
            <Suspense fallback={<div>Loading waitlist...</div>}>
              <DeepJournalingWaitlist />
            </Suspense>
          </div>
        </div>
      </div>
    </LadderlyPageWrapper>
  )
}

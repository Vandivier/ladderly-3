// src/app/journal/page.tsx

import { Suspense } from 'react'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import CreateJournalEntryForm from './CreateJournalEntryForm'
import JournalEntryList from './JournalEntryList'
import ReminderSettings from './ReminderSettings'
import PracticeSection from './PracticeSection'
import StoryGenerator from './StoryGenerator'
import { DeepJournalingWaitlist } from './DeepJournalingWaitlist'

export const metadata = {
  title: 'Journal',
  alternates: {
    canonical: '/journal',
  },
}

export default function JournalPage() {
  return (
    <LadderlyPageWrapper authenticate>
      <div className="container mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Career Journal</h1>
          <p className="text-gray-600">
            Track your career journey, document wins, and build your
            professional narrative
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Main content - journal form and entries */}
          <div className="flex-1">
            <Suspense fallback={<div>Loading form...</div>}>
              <CreateJournalEntryForm />
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

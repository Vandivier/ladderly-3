// src/app/community/page.tsx

import { Suspense } from 'react'
import { SmallCard } from '~/app/core/components/SmallCard'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { JobSearchList } from './JobSearchList'
import { CreateJobSearchModal } from './CreateJobSearchModal'

export const metadata = {
  title: 'Job Search',
  alternates: {
    canonical: '/job-search',
  },
}

export default function JobSearchPage() {
  return (
    <LadderlyPageWrapper authenticate requirePremium>
      <SmallCard
        className="mx-4 mt-4"
        innerClassName="bg-gradient-to-b from-white to-gray-100 pt-4 dark:from-gray-900 dark:to-gray-950 dark:text-gray-100"
      >
        <h1 className="mb-6 text-2xl font-bold">Job Search Archive</h1>
        <div className="mb-4">
          <CreateJobSearchModal />
        </div>

        <Suspense fallback="Loading...">
          <JobSearchList />
        </Suspense>
      </SmallCard>
    </LadderlyPageWrapper>
  )
}

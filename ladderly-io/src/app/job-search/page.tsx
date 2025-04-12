// src/app/community/page.tsx

import { Suspense } from 'react'
import { SmallCard } from '~/app/core/components/SmallCard'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { JobSearchList } from './JobSearchList'

export const metadata = {
  title: 'Job Search',
}

export default function JobSearchPage() {
  return (
    <LadderlyPageWrapper>
      <SmallCard className="mx-4 mt-4">
        <h1 className="mb-6 text-2xl font-bold">Job Search Archive</h1>
        <div className="mb-4 flex items-center gap-2">
          <button className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
            Create New Job Search
          </button>
        </div>

        <Suspense fallback="Loading...">
          <JobSearchList />
        </Suspense>
      </SmallCard>
    </LadderlyPageWrapper>
  )
}

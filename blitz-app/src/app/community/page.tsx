// app/community/page.tsx

import { Suspense } from 'react'
import { LargeCard } from 'src/core/components/LargeCard'
import { LadderlyPageWrapper } from 'src/core/components/page-wrapper/LadderlyPageWrapper'
import ClientCommunityPage from './ClientCommunityPage'

export default function CommunityPage() {
  return (
    <LadderlyPageWrapper title="Community">
      <LargeCard>
        <h1 className="text-2xl font-bold text-gray-800">Member Profiles</h1>
        <h3>Sorted by Signup Date</h3>
        <Suspense fallback="Loading...">
          <ClientCommunityPage />
        </Suspense>
      </LargeCard>
    </LadderlyPageWrapper>
  )
}

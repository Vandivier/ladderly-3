// src/app/community/page.tsx

import { Suspense } from 'react'
import { SmallCard } from '~/app/core/components/SmallCard'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import ClientCommunityPage from './ClientCommunityPage'

export const metadata = {
  title: 'Community',
}

export default function CommunityPage() {
  return (
    <LadderlyPageWrapper>
      <SmallCard className="mx-4 mt-4">
        <h1 className="mb-6 text-2xl font-bold">Community Member Profiles</h1>

        <Suspense fallback="Loading...">
          <ClientCommunityPage />
        </Suspense>
      </SmallCard>
    </LadderlyPageWrapper>
  )
}

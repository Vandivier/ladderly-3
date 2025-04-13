import { Suspense } from 'react'
import { SmallCard } from '~/app/core/components/SmallCard'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { LeetCodeList } from './LeetCodeList'
import { LeetCodeFilterControl } from './LeetCodeFilterControl'

export const metadata = {
  title: 'LeetCode Tool',
}

export default function LeetCodeToolPage() {
  return (
    <LadderlyPageWrapper authenticate requirePremium>
      <SmallCard className="mx-4 mt-4">
        <h1 className="mb-6 text-2xl font-bold">LeetCode Problem Archive</h1>
        <div className="mb-4">
          <LeetCodeFilterControl />
        </div>

        <Suspense fallback="Loading problems...">
          <LeetCodeList />
        </Suspense>
      </SmallCard>
    </LadderlyPageWrapper>
  )
}

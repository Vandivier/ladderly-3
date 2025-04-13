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
        <h1 className="mb-4 text-2xl font-bold">LeetCode Problem Tracker</h1>
        <p className="mb-6 text-gray-600">
          Track your progress through LeetCode problems from various curated
          lists. Problems are organized by source, including Ladderly Expanded
          Kata, Grind 75, Neetcode 250, and Sean Prashad Patterns. Check off
          problems as you complete them to track your interview preparation
          progress.
        </p>

        <div className="mb-6">
          <h2 className="mb-2 text-lg font-semibold">Filter Problems</h2>
          <LeetCodeFilterControl />
        </div>

        <Suspense fallback="Loading problems...">
          <LeetCodeList />
        </Suspense>
      </SmallCard>
    </LadderlyPageWrapper>
  )
}

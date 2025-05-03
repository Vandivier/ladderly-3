import { Suspense } from 'react'
import { SmallCard } from '~/app/core/components/SmallCard'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { LeetCodeList } from './LeetCodeList'
import { LeetCodeFilterControl } from './LeetCodeFilterControl'
import { CompletionStatusFilter } from './CompletionStatusFilter'
import { RandomProblemRecommendation } from './RandomProblemRecommendation'

export const metadata = {
  title: 'LeetCode Tool',
}

export default function LeetCodeToolPage() {
  return (
    <LadderlyPageWrapper authenticate>
      <SmallCard className="mx-4 mt-4">
        <h1 className="mb-4 text-2xl font-bold">LeetCode Problem Tracker</h1>

        <Suspense fallback="Loading recommendation...">
          <RandomProblemRecommendation />
        </Suspense>

        <p className="mb-6 text-xs text-gray-600 sm:text-sm">
          Track your progress through the Ladderly Leetcode 500, an
          evidence-based and industry-leading list that supersets well-known
          lists like the Grind 75, Neetcode 250, and Sean Prashad{"'"}s
          Patterns.
        </p>

        <div className="mb-6">
          <h2 className="mb-2 text-lg font-semibold">Filter Problems</h2>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
            <LeetCodeFilterControl />
            <CompletionStatusFilter />
          </div>
        </div>

        <Suspense fallback="Loading problems...">
          <LeetCodeList />
        </Suspense>
      </SmallCard>
    </LadderlyPageWrapper>
  )
}

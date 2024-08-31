// app/questions/page.tsx

import Link from 'next/link'
import { Suspense } from 'react'
import { LargeCard } from 'src/core/components/LargeCard'
import { LadderlyPageWrapper } from 'src/core/components/page-wrapper/LadderlyPageWrapper'
import ClientQuestionsPage from './ClientQuestionsPage'

export default function QuestionsPage() {
  return (
    <LadderlyPageWrapper title="Questions">
      <LargeCard>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Recent Questions
            </h1>
            <h3 className="text-sm text-gray-600">
              Explore or ask something new
            </h3>
          </div>
          <Link
            href="/questions/ask"
            className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
          >
            Ask a Question
          </Link>
        </div>
        <Suspense fallback="Loading questions...">
          <ClientQuestionsPage />
        </Suspense>
      </LargeCard>
    </LadderlyPageWrapper>
  )
}

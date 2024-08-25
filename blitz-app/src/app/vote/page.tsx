// File: app/vote/page.tsx

import { Suspense } from 'react'
import { LadderlyPageWrapper } from 'src/core/components/page-wrapper/LadderlyPageWrapper'
import VotePageContent from './components/VotePageContent'

export default function VotePage() {
  return (
    <LadderlyPageWrapper title="Vote">
      <Suspense fallback={<div>Loading...</div>}>
        <VotePageContent />
      </Suspense>
    </LadderlyPageWrapper>
  )
}

// app/questions/[questionId]/page.tsx

import { Suspense } from 'react'
import { LargeCard } from 'src/core/components/LargeCard'
import { LadderlyPageWrapper } from 'src/core/components/page-wrapper/LadderlyPageWrapper'
import QuestionDetails from './QuestionDetails'

export default function QuestionPage({
  params,
}: {
  params: { questionId: string }
}) {
  return (
    <LadderlyPageWrapper title="Question Details">
      <LargeCard>
        <Suspense fallback={<div>Loading question details...</div>}>
          <QuestionDetails questionId={parseInt(params.questionId)} />
        </Suspense>
      </LargeCard>
    </LadderlyPageWrapper>
  )
}

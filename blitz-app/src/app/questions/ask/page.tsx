// src/app/questions/ask/page.tsx

import { Suspense } from 'react'
import { LargeCard } from 'src/core/components/LargeCard'
import { LadderlyPageWrapper } from 'src/core/components/page-wrapper/LadderlyPageWrapper'
import { AskQuestionForm } from '../components/AskQuestionForm'

export default function AskQuestionPage() {
  return (
    <LadderlyPageWrapper title="Ask a Question">
      <LargeCard>
        <h1 className="mb-4 text-2xl font-bold text-gray-800">
          Ask a Question
        </h1>
        <p className="mb-6 text-gray-600">
          Be specific and imagine you're asking a question to another person.
          Include all the information someone would need to answer your
          question.
        </p>
        <Suspense fallback="Loading form...">
          <AskQuestionForm />
        </Suspense>
      </LargeCard>
    </LadderlyPageWrapper>
  )
}

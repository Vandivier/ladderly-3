import { Suspense } from 'react'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'

export const metadata = {
  title: 'Ladderly Chat',
  description: 'Chat using the Ladderly AI',
}

export default function ChatPage() {
  return (
    <LadderlyPageWrapper>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-800">Checklists</h1>

        <Suspense fallback={<div>Loading...</div>}>IDK BRO</Suspense>
      </div>
    </LadderlyPageWrapper>
  )
}

import { Suspense } from 'react'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { ClientChat } from './ClientChat'

export default function ChatPage() {
  return (
    <LadderlyPageWrapper>
      <Suspense fallback={<div>Loading...</div>}>
        <ClientChat />
      </Suspense>
    </LadderlyPageWrapper>
  )
}

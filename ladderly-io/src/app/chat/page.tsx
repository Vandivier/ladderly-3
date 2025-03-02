import { Suspense } from 'react'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { ClientChat } from './ClientChat'

export default async function ChatPage() {
  return (
    <LadderlyPageWrapper authenticate requirePremium>
      <Suspense fallback={<div>Loading...</div>}>
        <ClientChat />
      </Suspense>
    </LadderlyPageWrapper>
  )
}

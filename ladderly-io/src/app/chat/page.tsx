import { Suspense } from 'react'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { ClientChat } from './ClientChat'
import { getServerAuthSession } from '~/server/auth'
import Link from 'next/link'

export default async function ChatPage() {
  const session = await getServerAuthSession()

  if (!session) {
    return (
      <LadderlyPageWrapper>
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <p className="text-center text-gray-800 dark:text-gray-200">
            Please{' '}
            <Link href="/signup" className="text-blue-600 hover:underline">
              sign up
            </Link>{' '}
            or{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              log in
            </Link>{' '}
            to use Ladderly Chat.
          </p>
        </div>
      </LadderlyPageWrapper>
    )
  }

  return (
    <LadderlyPageWrapper>
      <Suspense fallback={<div>Loading...</div>}>
        <ClientChat />
      </Suspense>
    </LadderlyPageWrapper>
  )
}

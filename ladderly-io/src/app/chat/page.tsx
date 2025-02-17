import { Suspense } from 'react'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { ClientChat } from './ClientChat'
import { getServerAuthSession } from '~/server/auth'
import Link from 'next/link'
import { PaymentTierEnum } from '@prisma/client'

const STRIPE_PREMIUM_PAYMENT_LINK = 'https://buy.stripe.com/6oE7vZdWY3H18pO6ov'

export default async function ChatPage() {
  const session = await getServerAuthSession()
  const user = session?.user

  if (!session) {
    return (
      <LadderlyPageWrapper>
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <p className="text-center text-gray-800 dark:text-gray-200">
            Please{' '}
            <Link
              href="/signup?redirect=chat"
              className="text-blue-600 hover:underline"
            >
              sign up
            </Link>{' '}
            or{' '}
            <Link
              href="/login?redirect=chat"
              className="text-blue-600 hover:underline"
            >
              log in
            </Link>{' '}
            to use Ladderly Chat.
          </p>
        </div>
      </LadderlyPageWrapper>
    )
  }

  if (user && user.subscription.tier !== PaymentTierEnum.PREMIUM) {
    return (
      <LadderlyPageWrapper>
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <p className="text-center text-gray-800 dark:text-gray-200">
            A premium subscription is required to use Ladderly Chat. Please{' '}
            <Link
              href={{
                pathname: STRIPE_PREMIUM_PAYMENT_LINK,
                query: {
                  client_reference_id: user.id.toString(),
                },
              }}
              className="text-blue-600 hover:underline"
            >
              upgrade to premium
            </Link>{' '}
            - only $6/month!
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

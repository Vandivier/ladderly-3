import Link from 'next/link'
import { Suspense } from 'react'
import { api } from '~/trpc/server'
import { LargeCard } from '~/app/core/components/LargeCard'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { SettingsFormWrapper } from './components/SettingsFormWrapper'
import { redirect } from 'next/navigation'
import { PaymentTierEnum } from '@prisma/client'
import { UserSettingsFormValues } from '~/server/schemas'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Settings',
}

export default async function SettingsPage() {
  try {
    const rawSettings = await api.user.getSettings()
    const settings = UserSettingsFormValues.parse(rawSettings)
    const isPremium = settings.subscription.tier === PaymentTierEnum.FREE

    return (
      <LadderlyPageWrapper>
        <div className="flex items-center justify-center">
          <LargeCard>
            <h1 className="text-2xl font-bold text-gray-800">
              Edit User Settings
            </h1>
            <p className="mt-4">
              Welcome, User ID {settings.id}!{' '}
              {isPremium
                ? 'You are signed in to a free account.'
                : 'You are signed in to a premium account.'}{' '}
            </p>
            <p className="mt-4">
              Please email admin@ladderly.io for help requests, to update your
              subscription tier, or for general inquiries.
            </p>

            <Link
              className="mt-4 block text-ladderly-violet-700 underline"
              href={`/blog/2024-02-16-user-settings`}
            >
              Learn More About User Settings
            </Link>

            <Suspense fallback={<div>Loading form...</div>}>
              <SettingsFormWrapper initialSettings={settings} />
            </Suspense>
          </LargeCard>
        </div>
      </LadderlyPageWrapper>
    )
  } catch (error) {
    // redirect unauthorized users to home page
    console.error(error)
    redirect('/')
  }
}

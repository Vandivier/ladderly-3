import { PaymentTierEnum } from '@prisma/client'
import Link from 'next/link'
import { Suspense } from 'react'
import { LargeCard } from '~/app/core/components/LargeCard'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { UserSettingsFormValues } from '~/server/schemas'
import { api } from '~/trpc/server'
import { LadderlyPitch } from '../core/components/LadderlyPitch'
import { SettingsFormWrapper } from './components/SettingsFormWrapper'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Settings',
  alternates: {
    canonical: '/settings',
  },
}

export default async function SettingsPage() {
  try {
    const rawSettings = await api.user.getSettings()
    const settings = UserSettingsFormValues.parse(rawSettings)
    const isPremium = settings.subscription.tier !== PaymentTierEnum.FREE

    return (
      <LadderlyPageWrapper authenticate>
        <div className="flex items-center justify-center">
          <LargeCard>
            <h1 className="text-2xl font-bold text-gray-800">
              Edit User Settings
            </h1>
            <div className="mt-4">
              <p className="text-gray-700">
                Welcome, User ID {settings.id}!{' '}
                {isPremium
                  ? 'You are signed in to a premium account.'
                  : 'You are signed in to a free account.'}
              </p>
              {settings.emailVerified ? (
                <p className="mt-2 text-sm text-green-600">
                  ✓ Your email address has been verified.
                </p>
              ) : (
                <p className="mt-2 text-sm text-amber-600">
                  ⚠ Your email address has not been verified yet. Please check
                  your inbox for the verification email.
                </p>
              )}
            </div>
            <p className="mt-4 text-gray-700">
              Please email admin@ladderly.io for help requests, to update your
              subscription tier, or for general inquiries.
            </p>

            {isPremium ? null : (
              <Link
                className="mt-4 block text-ladderly-violet-700 underline"
                href={`/blog/2025-03-16-benefits-of-premium`}
              >
                Learn more about Ladderly Premium!
              </Link>
            )}

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
    // show pitch to unauthorized users
    console.error(error)
    return (
      <LadderlyPageWrapper>
        <LadderlyPitch />
      </LadderlyPageWrapper>
    )
  }
}

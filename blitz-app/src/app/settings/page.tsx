'use client'

import { useQuery } from '@blitzjs/rpc'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { LargeCard } from 'src/core/components/LargeCard'
import { LadderlyPageWrapper } from 'src/core/components/page-wrapper/LadderlyPageWrapper'
import { SettingsFormWrapper } from './components/SettingsFormWrapper'
import getSettings from './queries/getSettings'

export default function SettingsPage() {
  const router = useRouter()
  const [settings, { refetch }] = useQuery(getSettings, null)

  if (!settings) {
    router.push('/login')
    return null
  }

  return (
    <LadderlyPageWrapper title="Settings">
      <div className="flex items-center justify-center">
        <LargeCard>
          <h1 className="text-2xl font-bold text-gray-800">
            Edit User Settings
          </h1>
          <p className="mt-4">
            Please email john@ladderly.io to update your subscription tier.
          </p>

          <Link
            className="mt-4 block text-ladderly-violet-700 underline"
            href={`/blog/2024-02-16-user-settings`}
          >
            Learn More About User Settings
          </Link>

          <Suspense fallback={<div>Loading form...</div>}>
            <SettingsFormWrapper
              initialSettings={settings}
              refetchSettings={refetch}
            />
          </Suspense>
        </LargeCard>
      </div>
    </LadderlyPageWrapper>
  )
}

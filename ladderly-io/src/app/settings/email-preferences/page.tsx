import { Suspense } from 'react'
import { LargeCard } from '~/app/core/components/LargeCard'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { api } from '~/trpc/server'
import { LadderlyPitch } from '~/app/core/components/LadderlyPitch'
import { EmailPreferencesFormWrapper } from './components/EmailPreferencesFormWrapper'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Email Preferences',
  alternates: {
    canonical: '/settings/email-preferences',
  },
}

export default async function EmailPreferencesPage() {
  try {
    const leadPreferences = await api.user.getLeadEmailPreferences()

    return (
      <LadderlyPageWrapper authenticate>
        <div className="flex items-center justify-center">
          <LargeCard>
            <h1 className="text-2xl font-bold text-gray-800">
              Email Preferences
            </h1>

            <Suspense fallback={<div>Loading form...</div>}>
              <EmailPreferencesFormWrapper initialSettings={leadPreferences} />
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

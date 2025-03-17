import { Suspense } from 'react'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { ClientPremiumChecklist } from './ClientPremiumChecklist'

export const metadata = {
  title: 'Advanced Programming Job Checklist',
}

export default function MyPremiumChecklistPage() {
  return (
    <LadderlyPageWrapper authenticate requirePremium>
      <div className="relative min-h-screen">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="m-8 w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-xl">
            <h1 className="mb-4 text-2xl font-bold text-gray-800">
              Advanced Programming Job Checklist
            </h1>

            <p className="mb-4 mt-2">
              Items with an asterisk (*) are required for certification.
            </p>

            <Suspense fallback="Loading...">
              <ClientPremiumChecklist />
            </Suspense>
          </div>
        </div>
      </div>
    </LadderlyPageWrapper>
  )
}

import { Suspense } from 'react'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { ClientBasicChecklist } from './ClientBasicChecklist'
import Link from 'next/link'

export const metadata = {
  title: 'Programming Job Checklist',
}

export default function MyBasicChecklistPage() {
  return (
    <LadderlyPageWrapper authenticate>
      <div className="relative min-h-screen">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="m-4 w-full max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-xl">
            <Link
              href="/checklists"
              className="mb-2 block text-sm text-gray-500"
            >
              ← Back to Checklists
            </Link>
            <h1 className="mb-4 text-2xl font-bold text-gray-800">
              Programming Job Checklist
            </h1>

            <p className="mb-4 mt-2">
              Items with an asterisk (*) are required for certification.
            </p>

            <Suspense fallback="Loading...">
              <ClientBasicChecklist />
            </Suspense>
          </div>
        </div>
      </div>
    </LadderlyPageWrapper>
  )
}

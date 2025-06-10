import { Suspense } from 'react'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { ChecklistsList } from './ChecklistsList'

export const metadata = {
  title: 'Checklists',
  description: 'View and manage checklists for your programming career.',
}

export default function ChecklistsPage() {
  return (
    <LadderlyPageWrapper authenticate>
      <div className="bg-gray-50">
        <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Career Growth Checklists
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-500">
              Your comprehensive guides to navigating the tech industry, one
              step at a time.
            </p>
          </div>

          <div className="mt-12">
            <Suspense fallback={<ChecklistSkeleton />}>
              <ChecklistsList />
            </Suspense>
          </div>
        </div>
      </div>
    </LadderlyPageWrapper>
  )
}

function ChecklistSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-lg bg-white shadow-lg">
          <div className="p-6">
            <div className="h-6 w-3/4 rounded bg-gray-200"></div>
            <div className="mt-4 h-4 w-1/2 rounded bg-gray-200"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

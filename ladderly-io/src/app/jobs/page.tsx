import { Info } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { SmallCard } from '~/app/core/components/SmallCard'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { ClientJobsPage } from './ClientJobsPage'

export const metadata = {
  title: 'Job Board',
  description:
    'Browse fresh jobs on the Ladderly.io job board. Every job is transparently attached to a real person who can help you get hired.',
  alternates: {
    canonical: '/jobs',
  },
}

export default function JobsPage() {
  return (
    <LadderlyPageWrapper>
      <SmallCard className="mx-4 mt-4">
        <h1 className="mb-2 text-2xl font-bold">Job Board</h1>
        <div className="mb-2 flex items-center gap-2">
          <Info className="size-4 shrink-0" />
          <p className="text-sm">
            Every job is attached to a real person: either the poster is the
            direct contact, or they can intro you to someone at the company.
            Jobs expire after one month, so everything here is fresh.
          </p>
        </div>
        <div className="mb-4 flex flex-wrap gap-4 text-sm">
          <Link className="underline" href="/jobs/post">
            Post a Job
          </Link>
          <Link className="underline" href="/jobs/mine">
            My Job Posts
          </Link>
        </div>

        <Suspense fallback="Loading...">
          <ClientJobsPage />
        </Suspense>
      </SmallCard>
    </LadderlyPageWrapper>
  )
}

import { Suspense } from 'react'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { SmallCard } from '~/app/core/components/SmallCard'
import { JobSearchDetails } from './JobSearchDetails'

export const metadata = {
  title: 'Job Search Details',
}

export default function JobSearchDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <LadderlyPageWrapper authenticate requirePremium>
      <SmallCard className="mx-4 mt-4">
        <Suspense fallback="Loading job search details...">
          <JobSearchDetails id={parseInt(params.id)} />
        </Suspense>
      </SmallCard>
    </LadderlyPageWrapper>
  )
}

import { Suspense } from 'react'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { SmallCard } from '~/app/core/components/SmallCard'
import { JobPostDetails } from './JobPostDetails'

export const metadata = {
  title: 'Job Application Details',
}

export default function JobPostDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <LadderlyPageWrapper authenticate requirePremium>
      <SmallCard className="mx-4 mt-4">
        <Suspense fallback="Loading job application details...">
          <JobPostDetails id={parseInt(params.id)} />
        </Suspense>
      </SmallCard>
    </LadderlyPageWrapper>
  )
}

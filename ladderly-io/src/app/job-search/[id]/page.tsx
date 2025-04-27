import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { SmallCard } from '~/app/core/components/SmallCard'
import { JobSearchDetails } from './JobSearchDetails'
import { api } from '~/trpc/server'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'Job Search Details',
}

export default async function JobSearchDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const jobId = parseInt(params.id)
  if (isNaN(jobId)) {
    notFound()
  }

  // Fetch data server-side
  // Note: The getJobSearch query also expects pagination args, provide defaults
  // Call procedure directly on server
  const initialJobSearchData = await api.jobSearch.getJobSearch({
    id: jobId,
    page: 1, // Default page
    pageSize: 10, // Default page size (or match client default)
  })

  if (!initialJobSearchData) {
    notFound()
  }

  return (
    <LadderlyPageWrapper authenticate requirePremium>
      <SmallCard
        className="mx-4 mt-4"
        innerClassName="bg-gradient-to-b from-white to-gray-100 pt-4 dark:from-gray-900 dark:to-gray-950 dark:text-gray-100"
      >
        <JobSearchDetails initialJobSearch={initialJobSearchData} />
      </SmallCard>
    </LadderlyPageWrapper>
  )
}

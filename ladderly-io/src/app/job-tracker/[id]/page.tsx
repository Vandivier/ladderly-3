import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { SmallCard } from '~/app/core/components/SmallCard'
import { JobTrackerDetails } from './JobTrackerDetails'
import { api } from '~/trpc/server'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'Job Search Details',
}

export default async function JobSearchTrackerDetailsPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { page?: string }
}) {
  const jobId = parseInt(params.id)
  if (isNaN(jobId)) {
    notFound()
  }

  // Parse page from URL query params, default to 1
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1

  // Fetch data server-side with the correct page
  const initialJobSearchData = await api.jobSearch.getJobSearch({
    id: jobId,
    page: page,
    pageSize: 10, // Default page size
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
        <JobTrackerDetails initialJobSearch={initialJobSearchData} />
      </SmallCard>
    </LadderlyPageWrapper>
  )
}

import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { VeryLargeCard } from '~/app/core/components/VeryLargeCard'
import { api } from '~/trpc/server'
import { notFound } from 'next/navigation'
import { JobSearchGraphs } from './JobSearchGraphs'

export const metadata = {
  title: 'Job Search Analytics',
}

export default async function JobSearchGraphsPage({
  params,
}: {
  params: { id: string }
}) {
  const jobId = parseInt(params.id)
  if (isNaN(jobId)) {
    notFound()
  }

  // Fetch the job search to verify it exists and user has access
  const jobSearch = await api.jobSearch.getJobSearch({
    id: jobId,
    page: 1,
    pageSize: 10,
  })

  if (!jobSearch) {
    notFound()
  }

  return (
    <LadderlyPageWrapper authenticate requirePremium>
      <VeryLargeCard
        className="mx-4 mt-4"
        innerClassName="bg-gradient-to-b from-white to-gray-100 pt-4 dark:from-gray-900 dark:to-gray-950 dark:text-gray-100"
      >
        <div className="p-4">
          <h1 className="mb-6 text-2xl font-bold">
            Analytics for {jobSearch.name}
          </h1>
          <JobSearchGraphs jobSearchId={jobId} />
        </div>
      </VeryLargeCard>
    </LadderlyPageWrapper>
  )
}

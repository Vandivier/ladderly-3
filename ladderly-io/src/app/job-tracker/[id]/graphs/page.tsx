import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { VeryLargeCard } from '~/app/core/components/VeryLargeCard'
import { api } from '~/trpc/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { WeeklyApplicationsGraph } from './components/WeeklyApplicationsGraph'
import { ResumeEffectivenessGraph } from './components/ResumeEffectivenessGraph'
import { RoundPerformanceGraph } from './components/RoundPerformanceGraph'
import { InterviewFunnelSankey } from './components/InterviewFunnelSankey'

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
    pageSize: 100,
  })

  if (!jobSearch) {
    notFound()
  }

  // Safety check for job posts data
  const jobPosts = jobSearch?.jobPosts || []

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

          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            Understand your job search performance at a glance with four
            powerful premade charts, downsampled to 100 samples by default.
          </p>

          <div className="space-y-8">
            <div className="mb-4">
              <Link
                href={`/job-tracker/${jobId}`}
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                ← Back to Job Search Details
              </Link>
            </div>

            {jobPosts.length === 0 ? (
              <div className="rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
                <p className="text-center text-yellow-700 dark:text-yellow-200">
                  No application data available to visualize.
                  <Link
                    href={`/job-tracker/${jobId}`}
                    className="ml-2 underline"
                  >
                    Add some job applications
                  </Link>
                  to see analytics.
                </p>
              </div>
            ) : (
              <>
                {/* Weekly Applications Graph */}
                <WeeklyApplicationsGraph jobPosts={jobPosts} />

                {/* Resume Effectiveness Graph */}
                <ResumeEffectivenessGraph jobPosts={jobPosts} />

                {/* Interview Funnel Sankey Diagram */}
                <InterviewFunnelSankey jobPosts={jobPosts} />

                {/* Interview Round Performance Graph */}
                <RoundPerformanceGraph jobPosts={jobPosts} />

                <div className="mt-4 text-center text-sm text-gray-500">
                  Total applications: {jobPosts.length}
                </div>
              </>
            )}
          </div>
        </div>
      </VeryLargeCard>
    </LadderlyPageWrapper>
  )
}

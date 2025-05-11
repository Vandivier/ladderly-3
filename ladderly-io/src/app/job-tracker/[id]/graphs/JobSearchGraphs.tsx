'use client'

import Link from 'next/link'
import React from 'react'
import { ResumeEffectivenessGraph } from '~/app/job-tracker/[id]/graphs/components/ResumeEffectivenessGraph'
import { RoundPerformanceGraph } from '~/app/job-tracker/[id]/graphs/components/RoundPerformanceGraph'
import { WeeklyApplicationsGraph } from '~/app/job-tracker/[id]/graphs/components/WeeklyApplicationsGraph'
import { api } from '~/trpc/react'

// Main container component that shows all the job search analytics graphs
export function JobSearchGraphs({ jobSearchId }: { jobSearchId: number }) {
  // Fetch job search data
  const {
    data: jobSearch,
    isLoading,
    error: queryError,
  } = api.jobSearch.getJobSearch.useQuery({
    id: jobSearchId,
    page: 1,
    pageSize: 100, // Get more applications to analyze
  })

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">Loading application data...</div>
    )
  }

  if (queryError) {
    return (
      <div className="text-red-500">
        {queryError.message || 'Failed to load job search data'}
      </div>
    )
  }

  // Safety check for job posts data
  const jobPosts = jobSearch?.jobPosts ?? []

  // If no application data, show a message
  if (!jobPosts.length) {
    return (
      <div className="space-y-8">
        <div className="mb-4">
          <Link
            href={`/job-tracker/${jobSearchId}`}
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            ← Back to Job Search Details
          </Link>
        </div>

        <div className="rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <p className="text-center text-yellow-700 dark:text-yellow-200">
            No application data available to visualize.
            <Link
              href={`/job-tracker/${jobSearchId}`}
              className="ml-2 underline"
            >
              Add some job applications
            </Link>
            to see analytics.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="mb-4">
        <Link
          href={`/job-tracker/${jobSearchId}`}
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to Job Search Details
        </Link>
      </div>

      {/* Weekly Applications Graph */}
      <WeeklyApplicationsGraph jobPosts={jobPosts} />

      {/* Resume Effectiveness Graph */}
      <ResumeEffectivenessGraph jobPosts={jobPosts} />

      {/* Interview Round Performance Graph */}
      <RoundPerformanceGraph jobPosts={jobPosts} />

      <div className="mt-4 text-center text-sm text-gray-500">
        Total applications: {jobPosts.length}
      </div>
    </div>
  )
}

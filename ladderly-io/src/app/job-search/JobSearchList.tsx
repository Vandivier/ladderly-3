// src/app/job-search/JobSearchList.tsx

'use client'

import Link from 'next/link'
import React from 'react'
import { api } from '~/trpc/react'
import { JobSearchActiveSpan } from './JobSearchActiveSpan'
import { BarChart3, Trash2 } from 'lucide-react'

export const JobSearchList = () => {
  const {
    data: jobSearches,
    isLoading,
    refetch,
  } = api.jobSearch.getUserJobSearches.useQuery({ includeInactive: true })

  const { mutate: deleteJobSearch } = api.jobSearch.deleteJobSearch.useMutation(
    {
      onSuccess: async () => {
        await refetch()
      },
    },
  )

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation() // Prevent navigation when clicking delete

    if (confirm('Are you sure you want to delete this job search?')) {
      deleteJobSearch({ id })
    }
  }

  if (isLoading) {
    return <p>Loading job searches...</p>
  }

  if (!jobSearches?.length) {
    return (
      <p className="text-gray-500">
        No job searches found. Create one to get started!
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {jobSearches.map((jobSearch) => (
        <div
          key={jobSearch.id}
          className="rounded-md border border-gray-200 dark:from-gray-900 dark:to-gray-950"
        >
          <Link
            href={`/job-search/${jobSearch.id}`}
            className="block p-4 no-underline"
          >
            <div className="flex items-center justify-between">
              <div className="max-w-[80%] flex-1">
                <div>
                  <JobSearchActiveSpan isActive={jobSearch.isActive} />
                  <h3 className="font-semibold">{jobSearch.name}</h3>
                </div>

                <div className="mt-1 flex flex-wrap text-sm text-gray-500">
                  <span className="mr-4">
                    {jobSearch._count?.jobPosts || 0} applications
                  </span>
                  <span className="mr-4">
                    Created {new Date(jobSearch.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  href={`/job-search/${jobSearch.id}/graphs`}
                  className="rounded-full p-2 text-blue-500 hover:bg-blue-50"
                  aria-label="View analytics"
                  onClick={(e) => e.stopPropagation()}
                >
                  <BarChart3 size={16} />
                </Link>
                <button
                  onClick={(e) => handleDelete(jobSearch.id, e)}
                  className="rounded-full p-2 text-red-500 hover:bg-red-50"
                  aria-label="Delete job search"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  )
}

// src/app/job-search/JobSearchList.tsx

'use client'

import Link from 'next/link'
import React from 'react'
import { api } from '~/trpc/react'
import { JobSearchActiveSpan } from './JobSearchActiveSpan'

export const JobSearchList = () => {
  const {
    data: jobSearches,
    isLoading,
    refetch,
  } = api.jobSearch.getUserJobSearches.useQuery()

  const { mutate: deleteJobSearch } = api.jobSearch.deleteJobSearch.useMutation(
    {
      onSuccess: () => {
        refetch()
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
          className="rounded-md border border-gray-200 hover:bg-gray-50"
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
              <button
                onClick={(e) => handleDelete(jobSearch.id, e)}
                className="ml-2 rounded-full p-2 text-red-500 hover:bg-red-50"
                aria-label="Delete job search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </Link>
        </div>
      ))}
    </div>
  )
}

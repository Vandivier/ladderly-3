// src/app/job-search/JobSearchList.tsx

'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { api } from '~/trpc/react'

export const JobSearchList = () => {
  const router = useRouter()
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
    e.stopPropagation() // Prevent navigation when clicking delete

    if (confirm('Are you sure you want to delete this job search?')) {
      deleteJobSearch({ id })
    }
  }

  const navigateToJobSearch = (id: number) => {
    router.push(`/job-search/${id}`)
  }

  if (isLoading) {
    return <p className="p-4">Loading job searches...</p>
  }

  if (!jobSearches || jobSearches.length === 0) {
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
          onClick={() => navigateToJobSearch(jobSearch.id)}
          className="flex cursor-pointer items-center justify-between rounded-md border border-gray-200 p-4 hover:bg-gray-50"
        >
          <div className="flex-1">
            <h3 className="font-semibold">{jobSearch.name}</h3>
            <div className="mt-1 flex text-sm text-gray-500">
              <span className="mr-4">
                {jobSearch._count?.jobPosts || 0} applications
              </span>
              <span className="mr-4">
                Created {new Date(jobSearch.createdAt).toLocaleDateString()}
              </span>
              <span
                className={
                  jobSearch.isActive ? 'text-green-500' : 'text-red-500'
                }
              >
                {jobSearch.isActive ? 'Active' : 'Inactive'}
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
      ))}
    </div>
  )
}

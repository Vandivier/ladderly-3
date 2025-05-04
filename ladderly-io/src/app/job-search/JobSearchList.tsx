// src/app/job-search/JobSearchList.tsx

'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { api } from '~/trpc/react'
import { JobSearchActiveSpan } from './JobSearchActiveSpan'
import { BarChart3, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import type { JobSearch } from '@prisma/client'

// Type for job search with count
interface JobSearchWithCount extends JobSearch {
  _count: {
    jobPosts: number
  }
}

export const JobSearchList = () => {
  const searchParams = useSearchParams()
  const pathname = usePathname()

  // Check if we're on the job search list page, not a detail page
  const isJobSearchListPage = pathname === '/job-search'

  // Parse page from URL query params, default to 1
  const initialPage = parseInt(searchParams.get('page') ?? '1', 10)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const pageSize = 10

  // Listen for popstate events (back/forward browser navigation)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      const pageParam = params.get('page')
      const newPage = pageParam ? parseInt(pageParam, 10) : 1

      if (newPage !== currentPage) {
        setCurrentPage(newPage)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [currentPage])

  // Also update currentPage if searchParams change externally
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page') ?? '1', 10)
    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl)
    }
  }, [searchParams, currentPage])

  const { data, isLoading, refetch } =
    api.jobSearch.getUserJobSearches.useQuery({
      includeInactive: true,
      page: currentPage,
      pageSize,
    })

  const jobSearches = data?.jobSearches ?? []
  const totalPages = data?.pagination?.totalPages ?? 1
  const totalItems = data?.pagination?.totalItems ?? 0

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
    return (
      <p className="text-gray-500 dark:text-gray-400">
        Loading job searches...
      </p>
    )
  }

  if (!jobSearches?.length) {
    return (
      <p className="text-gray-500 dark:text-gray-400">
        No job searches found. Create one to get started!
      </p>
    )
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {totalItems} total job search{totalItems !== 1 ? 'es' : ''}
        </p>
      </div>

      <div className="space-y-4">
        {jobSearches.map((jobSearch: JobSearchWithCount) => (
          <div
            key={jobSearch.id}
            className="rounded-md border border-gray-200 dark:border-gray-700 dark:from-gray-900 dark:to-gray-950"
          >
            <Link
              href={`/job-search/${jobSearch.id}`}
              className="block p-4 no-underline"
            >
              <div className="flex items-center justify-between">
                <div className="max-w-[80%] flex-1">
                  <div>
                    <JobSearchActiveSpan isActive={jobSearch.isActive} />
                    <h3 className="font-semibold dark:text-white">
                      {jobSearch.name}
                    </h3>
                  </div>

                  <div className="mt-1 flex flex-wrap text-sm text-gray-500 dark:text-gray-400">
                    <span className="mr-4">
                      {jobSearch._count?.jobPosts ?? 0} applications
                    </span>
                    <span className="mr-4">
                      Created{' '}
                      {new Date(jobSearch.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/job-search/${jobSearch.id}/graphs`}
                    className="rounded-full p-2 text-blue-500 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                    aria-label="View analytics"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <BarChart3 size={16} />
                  </Link>
                  <button
                    onClick={(e) => handleDelete(jobSearch.id, e)}
                    className="rounded-full p-2 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
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

      {totalPages > 1 && isJobSearchListPage && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
          {currentPage > 1 ? (
            <Link
              href={`?page=${currentPage - 1}`}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <ChevronLeft className="-ml-1 mr-1 size-5" />
              Previous
            </Link>
          ) : (
            <button
              disabled
              className="inline-flex cursor-not-allowed items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
            >
              <ChevronLeft className="-ml-1 mr-1 size-5" />
              Previous
            </button>
          )}

          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>

          {currentPage < totalPages ? (
            <Link
              href={`?page=${currentPage + 1}`}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
              <ChevronRight className="-mr-1 ml-1 size-5" />
            </Link>
          ) : (
            <button
              disabled
              className="inline-flex cursor-not-allowed items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
            >
              Next
              <ChevronRight className="-mr-1 ml-1 size-5" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

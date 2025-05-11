'use client'

import React, { useState, useCallback } from 'react'
import type { JobPostForCandidate, JobSearch } from '@prisma/client'
import { Edit, Trash2 } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { api } from '~/trpc/react'
import Link from 'next/link'

// Component for displaying job post status
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'interview':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'offer':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'accepted':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
      case 'declined':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
        status,
      )}`}
    >
      {status}
    </span>
  )
}

interface JobPostListProps {
  jobSearch: JobSearch
  jobPosts: JobPostForCandidate[]
  currentPage: number
  pageSize: number
  totalPages: number
  isLoading: boolean
  onPageChange: (page: number) => void
}

export const JobPostList: React.FC<JobPostListProps> = ({
  jobSearch,
  jobPosts,
  currentPage,
  pageSize,
  totalPages,
  isLoading,
  onPageChange,
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const [deleting, setDeleting] = useState<Record<number, boolean>>({})

  // Handle page change and update URL
  const handlePageChange = useCallback(
    (page: number) => {
      // Update the URL with the page parameter
      const params = new URLSearchParams()
      params.set('page', page.toString())

      // Use Next.js router to update the URL
      window.history.pushState({}, '', `${pathname}?${params.toString()}`)

      // Update the component state
      onPageChange(page)
    },
    [pathname, onPageChange],
  )

  // Get the delete mutation from tRPC
  const { mutate: deleteJobPost } = api.jobSearch.jobPost.delete.useMutation({
    onSuccess: () => {
      router.refresh()
    },
  })

  // Handle deleting a job post
  const handleDeleteJobPost = async (jobPostId: number) => {
    if (confirm('Are you sure you want to delete this job post?')) {
      setDeleting((prev) => ({ ...prev, [jobPostId]: true }))
      try {
        // Use the mutation function directly
        deleteJobPost({ id: jobPostId })
        setDeleting((prev) => ({ ...prev, [jobPostId]: false }))
      } catch (error) {
        console.error('Failed to delete job post', error)
        setDeleting((prev) => ({ ...prev, [jobPostId]: false }))
        alert('Failed to delete job post')
      }
    }
  }

  // Format date relative to current time
  const formatRelative = (date: Date | string): string => {
    if (!date) return 'Not specified'
    const dateObj = new Date(date)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - dateObj.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else if (diffDays < 30) {
      const diffWeeks = Math.floor(diffDays / 7)
      return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`
    } else if (diffDays < 365) {
      const diffMonths = Math.floor(diffDays / 30)
      return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`
    } else {
      return dateObj.toLocaleDateString()
    }
  }

  return (
    <div className="mt-6">
      <h3 className="mb-3 text-lg font-semibold">Job Applications</h3>

      {jobPosts.length === 0 ? (
        <div className="rounded-md border border-gray-200 p-4 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
          No job applications found. Add one to get started!
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {jobPosts.map((post) => (
              <div
                key={post.id}
                className="dark:hover:bg-gray-750 relative rounded-md border border-gray-200 bg-white p-4 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="relative z-0 flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  <Link
                    href={`/job-tracker/job-post/${post.id}`}
                    className="relative z-0 flex-1 cursor-pointer"
                    aria-label={`View details for ${post.company} - ${post.jobTitle}`}
                  >
                    <div className="flex items-center">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {post.company}
                      </h4>
                      <div className="ml-3">
                        <StatusBadge status={post.status} />
                      </div>
                    </div>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">
                      {post.jobTitle}
                    </p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {post.initialApplicationDate
                        ? `Applied ${formatRelative(post.initialApplicationDate)}`
                        : 'Application date not specified'}
                    </p>
                    {post.jobPostUrl && (
                      <a
                        href={post.jobPostUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative z-10 mt-2 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Job Posting
                      </a>
                    )}
                  </Link>
                  <div className="relative z-10 mt-4 flex space-x-2 sm:mt-0">
                    <Link
                      href={`/job-tracker/job-post/${post.id}`}
                      className="rounded bg-blue-50 px-3 py-1 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-800/30"
                      aria-label="Edit job post"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation()
                        await handleDeleteJobPost(post.id)
                      }}
                      disabled={deleting[post.id]}
                      className={`rounded bg-red-50 px-3 py-1 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-800/30 ${
                        deleting[post.id] ? 'opacity-50' : ''
                      }`}
                      aria-label="Delete job post"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Applications {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, totalPages * pageSize)} of{' '}
                {totalPages * pageSize}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || isLoading}
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600 dark:disabled:text-gray-500"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages || isLoading}
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600 dark:disabled:text-gray-500"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

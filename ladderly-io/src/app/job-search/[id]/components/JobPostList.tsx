'use client'

import React, { useState } from 'react'
import type { JobPostForCandidate, JobSearch } from '@prisma/client'
import { Edit, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { api } from '~/trpc/react'

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
  onEditJobPost: (jobPost: JobPostForCandidate) => void
}

export const JobPostList: React.FC<JobPostListProps> = ({
  jobSearch,
  jobPosts,
  currentPage,
  pageSize,
  totalPages,
  isLoading,
  onPageChange,
  onEditJobPost,
}) => {
  const router = useRouter()
  const [deleting, setDeleting] = useState<Record<number, boolean>>({})

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
          <div className="mb-4 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    Company
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    Position
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    Date Applied
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                {jobPosts.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {post.company}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {post.jobTitle}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {post.initialApplicationDate
                        ? formatRelative(post.initialApplicationDate)
                        : 'Not specified'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEditJobPost(post)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          aria-label="Edit job post"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteJobPost(post.id)}
                          disabled={deleting[post.id]}
                          className={`text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ${
                            deleting[post.id] ? 'opacity-50' : ''
                          }`}
                          aria-label="Delete job post"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Applications {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, totalPages * pageSize)} of{' '}
                {totalPages * pageSize}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || isLoading}
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600"
                >
                  Previous
                </button>
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages || isLoading}
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600"
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

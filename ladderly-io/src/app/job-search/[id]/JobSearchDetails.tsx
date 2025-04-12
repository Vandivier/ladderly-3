'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '~/trpc/react'
import { JobSearchActiveSpan } from '../JobSearchActiveSpan'
import { AddJobApplicationModal } from './AddJobApplicationModal'

export const JobSearchDetails = ({ id }: { id: number }) => {
  const router = useRouter()
  const [showAddApplicationModal, setShowAddApplicationModal] = useState(false)
  const [deletingJobPostId, setDeletingJobPostId] = useState<number | null>(
    null,
  )

  const {
    data: jobSearch,
    isLoading,
    error,
    refetch,
  } = api.jobSearch.getJobSearch.useQuery({ id })

  const { mutate: deleteJobPost } = api.jobSearch.deleteJobPost.useMutation({
    onSuccess: () => {
      refetch()
      setDeletingJobPostId(null)
    },
  })

  const handleDeleteJobPost = (jobPostId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (confirm('Are you sure you want to delete this job application?')) {
      setDeletingJobPostId(jobPostId)
      deleteJobPost({ id: jobPostId })
    }
  }

  if (isLoading) {
    return <div>Loading job search details...</div>
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-500">{error.message}</p>
        <button
          onClick={() => router.push('/job-search')}
          className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white"
        >
          Back to Job Searches
        </button>
      </div>
    )
  }

  if (!jobSearch) {
    return (
      <div className="text-center">
        <p>Job search not found</p>
        <button
          onClick={() => router.push('/job-search')}
          className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white"
        >
          Back to Job Searches
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{jobSearch.name}</h1>
        <button
          onClick={() => router.push('/job-search')}
          className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
        >
          Back
        </button>
      </div>

      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <JobSearchActiveSpan isActive={jobSearch.isActive} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Started</p>
            <p className="font-medium">
              {new Date(jobSearch.startDate).toLocaleDateString()}
            </p>
          </div>
          {jobSearch.endDate && (
            <div>
              <p className="text-sm text-gray-500">Ended</p>
              <p className="font-medium">
                {new Date(jobSearch.endDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {jobSearch.notes && (
        <div className="mb-6">
          <h3 className="mb-2 text-lg font-medium">Notes</h3>
          <p className="whitespace-pre-wrap text-gray-700">{jobSearch.notes}</p>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Applications ({jobSearch.jobPosts.length})
          </h2>
          <button
            onClick={() => setShowAddApplicationModal(true)}
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Add Application
          </button>
        </div>

        {jobSearch.jobPosts.length === 0 ? (
          <p className="mt-4 text-gray-500">
            No applications yet. Add your first job application to get started!
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {jobSearch.jobPosts.map((jobPost) => (
              <div
                key={jobPost.id}
                className="rounded-md border border-gray-200 p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">{jobPost.jobTitle}</h3>
                    <p className="text-sm text-gray-600">{jobPost.company}</p>
                  </div>
                  <div className="flex items-start">
                    <div className="text-right">
                      <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                        {jobPost.status}
                      </span>
                      <p className="mt-1 text-xs text-gray-500">
                        Last updated:{' '}
                        {new Date(jobPost.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteJobPost(jobPost.id, e)}
                      className="ml-3 rounded-full p-1 text-red-500 hover:bg-red-50 disabled:opacity-50"
                      disabled={deletingJobPostId === jobPost.id}
                      aria-label="Delete job application"
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddApplicationModal && (
        <AddJobApplicationModal
          jobSearchId={id}
          onClose={() => setShowAddApplicationModal(false)}
          onSuccess={() => {
            refetch()
            setShowAddApplicationModal(false)
          }}
        />
      )}
    </div>
  )
}

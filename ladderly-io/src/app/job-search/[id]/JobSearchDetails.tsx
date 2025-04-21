'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '~/trpc/react'
import { JobSearchActiveSpan } from '../JobSearchActiveSpan'
import { AddJobApplicationModal } from './AddJobApplicationModal'
import Link from 'next/link'
import { Pencil, Check, X } from 'lucide-react'

// Helper to format date to YYYY-MM-DD
const formatDateForInput = (date: Date | string | undefined | null): string => {
  if (!date) return ''
  try {
    return new Date(date).toISOString().split('T')[0] ?? ''
  } catch (e) {
    return ''
  }
}

export const JobSearchDetails = ({ id }: { id: number }) => {
  const router = useRouter()
  const [showAddApplicationModal, setShowAddApplicationModal] = useState(false)
  const [deletingJobPostId, setDeletingJobPostId] = useState<number | null>(
    null,
  )
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editStartDate, setEditStartDate] = useState('')
  const [editIsActive, setEditIsActive] = useState(true)
  const [editError, setEditError] = useState<string | null>(null)

  const {
    data: jobSearch,
    isLoading,
    error,
    refetch,
  } = api.jobSearch.getJobSearch.useQuery({ id })

  const { mutate: deleteJobPost } = api.jobSearch.deleteJobPost.useMutation({
    onSuccess: async () => {
      await refetch()
      setDeletingJobPostId(null)
    },
  })

  const { mutate: updateJobSearch, isPending: isUpdating } =
    api.jobSearch.updateJobSearch.useMutation({
      onSuccess: async () => {
        await refetch()
        setIsEditing(false)
        setEditError(null)
      },
      onError: (error) => {
        setEditError(error.message ?? 'Failed to update job search')
      },
    })

  // Initialize edit state when jobSearch data loads
  useEffect(() => {
    if (jobSearch) {
      setEditName(jobSearch.name)
      setEditStartDate(formatDateForInput(jobSearch.startDate))
      setEditIsActive(jobSearch.isActive)
    }
  }, [jobSearch])

  const handleDeleteJobPost = (jobPostId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (confirm('Are you sure you want to delete this job application?')) {
      setDeletingJobPostId(jobPostId)
      deleteJobPost({ id: jobPostId })
    }
  }

  const handleEditClick = () => {
    if (!jobSearch) return
    setEditName(jobSearch.name)
    setEditStartDate(formatDateForInput(jobSearch.startDate))
    setEditIsActive(jobSearch.isActive)
    setEditError(null)
    setIsEditing(true)
  }

  const handleCancelClick = () => {
    setIsEditing(false)
    setEditError(null)
    // Reset state if needed, useEffect already does this when data loads
  }

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEditError(null)
    if (!editName.trim()) {
      setEditError('Job search name cannot be empty')
      return
    }
    if (!editStartDate) {
      setEditError('Start date cannot be empty')
      return
    }

    updateJobSearch({
      id,
      name: editName.trim(),
      startDate: new Date(editStartDate),
      isActive: editIsActive,
    })
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
      <button
        onClick={() => router.push('/job-search')}
        className="mb-4 inline-block text-blue-600 hover:text-blue-800 hover:underline"
      >
        ← Back to Job Search Archive
      </button>

      <div className="mb-6 flex items-start justify-between">
        {!isEditing ? (
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{jobSearch.name}</h1>
            <button
              onClick={handleEditClick}
              className="self-baseline p-2 text-gray-500 hover:text-gray-700"
            >
              <Pencil className="size-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Editing Job Search</h1>
          </div>
        )}
      </div>

      {isEditing ? (
        <form
          onSubmit={handleSaveSubmit}
          className="mb-6 rounded-md border border-gray-200 bg-gray-50 p-4"
        >
          <div className="mb-4">
            <label
              htmlFor="editName"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              id="editName"
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="editStartDate"
                className="block text-sm font-medium text-gray-700"
              >
                Start Date
              </label>
              <input
                id="editStartDate"
                type="date"
                value={editStartDate}
                onChange={(e) => setEditStartDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div className="flex items-end">
              <div className="flex items-center">
                <input
                  id="editIsActive"
                  type="checkbox"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="editIsActive"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Active
                </label>
              </div>
            </div>
          </div>

          {editError && (
            <p className="mb-4 text-sm text-red-500">{editError}</p>
          )}

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleCancelClick}
              disabled={isUpdating}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
            >
              <X className="-ml-1 mr-2 size-5" /> Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              <Check className="-ml-1 mr-2 size-5" />{' '}
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <JobSearchActiveSpan isActive={jobSearch.isActive} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Started</p>
              <p className="font-medium">
                {formatDateForInput(jobSearch.startDate)
                  ? new Date(jobSearch.startDate).toLocaleDateString()
                  : 'N/A'}
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
      )}

      {!isEditing && jobSearch.notes && (
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
                <div className="flex items-center justify-between">
                  <div className="max-w-[50%] flex-1">
                    <div>
                      <Link
                        href={`/job-search/job-post/${jobPost.id}`}
                        className="hover:text-blue-600"
                      >
                        <h3 className="break-words font-medium">
                          {jobPost.jobTitle}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600">{jobPost.company}</p>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Last updated:{' '}
                      {new Date(jobPost.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                      {jobPost.status}
                    </span>
                    <Link
                      href={`/job-search/job-post/${jobPost.id}`}
                      className="ml-2 rounded-full p-2 text-blue-500 hover:bg-blue-50"
                      aria-label="View application details"
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
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </Link>
                    <button
                      onClick={(e) => handleDeleteJobPost(jobPost.id, e)}
                      className="ml-2 rounded-full p-2 text-red-500 hover:bg-red-50 disabled:opacity-50"
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
          onSuccess={async () => {
            await refetch()
            setShowAddApplicationModal(false)
          }}
        />
      )}
    </div>
  )
}

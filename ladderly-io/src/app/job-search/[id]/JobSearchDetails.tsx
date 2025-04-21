'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '~/trpc/react'
import { JobSearchActiveSpan } from '../JobSearchActiveSpan'
import { AddJobApplicationModal } from './AddJobApplicationModal'
import Link from 'next/link'
import { Pencil, Check, X, ChevronLeft, ChevronRight } from 'lucide-react'
// import { JobPostTable } from './JobPostTable' // Commented out - Linter couldn't find module
import { Form, FORM_ERROR } from '~/app/core/components/Form'
import LabeledTextField from '~/app/core/components/LabeledTextField'
import { z } from 'zod'
import { JobSearch } from '@prisma/client' // Import JobSearch type

// Helper to format date to YYYY-MM-DD
const formatDateForInput = (date: Date | string | undefined | null): string => {
  if (!date) return ''
  try {
    return new Date(date).toISOString().split('T')[0] ?? ''
  } catch (e) {
    return ''
  }
}

// Schema for editing the Job Search name
const JobSearchEditSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty'),
})

interface JobSearchDetailsProps {
  initialJobSearch: JobSearch & { jobPosts: any[] } // Use imported JobSearch type
}

export const JobSearchDetails: React.FC<JobSearchDetailsProps> = ({
  initialJobSearch,
}) => {
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
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const utils = api.useUtils() // Get tRPC utils

  const {
    data: jobSearchData,
    isLoading,
    error,
    refetch,
  } = api.jobSearch.getJobSearch.useQuery(
    { id: initialJobSearch.id, page: currentPage, pageSize },
    {
      // Keep fetched data fresh but don't refetch on window focus if not needed
      // staleTime: 5 * 60 * 1000, // 5 minutes
      // refetchOnWindowFocus: false,
      // Only run the query if the initial ID is available
      enabled: !!initialJobSearch?.id,
    },
  )
  const jobSearch = jobSearchData
  const pagination = jobSearchData?.pagination

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
        await utils.jobSearch.getUserJobSearches.invalidate()
        setIsEditing(false)
        setEditError(null)
      },
      onError: (error) => {
        setEditError(error.message ?? 'Failed to update job search')
      },
    })

  useEffect(() => {
    // Only update edit state if jobSearch is available
    if (jobSearch) {
      setEditName(jobSearch.name)
      setEditStartDate(formatDateForInput(jobSearch.startDate))
      setEditIsActive(jobSearch.isActive)
    }
    // Add initialJobSearch.id to dependency array to re-run if ID changes (although unlikely)
  }, [jobSearch, initialJobSearch?.id])

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

    // Call the mutation with data from state
    updateJobSearch({
      id: initialJobSearch.id, // Use the initial ID prop
      name: editName.trim(),
      startDate: new Date(editStartDate),
      isActive: editIsActive,
    })
  }

  const handleNextPage = () => {
    if (pagination && currentPage < pagination.totalPages) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  if (isLoading && !jobSearchData) {
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
              disabled={!jobSearch}
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
          className="mb-6 space-y-4 rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
        >
          <div>
            <label
              htmlFor="editName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Name*
            </label>
            <input
              id="editName"
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="input-field mt-1 w-full"
              required
              disabled={isUpdating}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="editStartDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Start Date*
              </label>
              <input
                id="editStartDate"
                type="date"
                value={editStartDate}
                onChange={(e) => setEditStartDate(e.target.value)}
                className="input-field mt-1 w-full"
                required
                disabled={isUpdating}
              />
            </div>
            <div className="flex items-end pb-1">
              <div className="flex items-center">
                <input
                  id="editIsActive"
                  type="checkbox"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="checkbox-field mr-2"
                  disabled={isUpdating}
                />
                <label
                  htmlFor="editIsActive"
                  className="text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  Active
                </label>
              </div>
            </div>
          </div>

          {editError && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {editError}
            </p>
          )}

          <div className="flex justify-end space-x-2 border-t border-gray-200 pt-4 dark:border-gray-700">
            <button
              type="button"
              onClick={handleCancelClick}
              disabled={isUpdating}
              className="btn-secondary"
            >
              <X className="btn-icon mr-1" /> Cancel
            </button>
            <button type="submit" disabled={isUpdating} className="btn-primary">
              <Check className="btn-icon mr-1" />{' '}
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
            Applications ({pagination?.totalItems ?? 0})
          </h2>
          <button
            onClick={() => setShowAddApplicationModal(true)}
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Add Application
          </button>
        </div>

        {jobSearch.jobPosts.length === 0 && pagination?.totalItems === 0 ? (
          <p className="mt-4 text-gray-500">
            No applications yet. Add your first job application to get started!
          </p>
        ) : (
          <>
            {/* Commented out JobPostTable usage
            <JobPostTable jobPosts={jobSearch?.jobPosts ?? []} />
            */}

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1 || isLoading}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="-ml-1 mr-1 size-5" />
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === pagination.totalPages || isLoading}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="-mr-1 ml-1 size-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showAddApplicationModal && (
        <AddJobApplicationModal
          jobSearchId={initialJobSearch.id}
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

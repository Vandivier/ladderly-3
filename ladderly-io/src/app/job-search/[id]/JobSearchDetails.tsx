'use client'

import React, { useState } from 'react'
import { api } from '~/trpc/react'
import { FORM_ERROR, type FormProps } from '~/app/core/components/Form'
import type { TRPCClientErrorLike } from '@trpc/client'
import type { JobSearch, JobPostForCandidate } from '@prisma/client'
import { JobSearchHeader } from './components/JobSearchHeader'
import {
  JobSearchEditForm,
  type JobSearchEditSchema,
} from './components/JobSearchEditForm'
import { JobPostList } from './components/JobPostList'
import { AddJobPostModal } from './components/AddJobPostModal'
import { EditJobPostModal } from './components/EditJobPostModal'
import { UploadCsvModal } from './components/UploadCsvModal'

// Define a proper type for job search data with pagination
interface JobSearchPagination {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
}

interface JobSearchWithPosts extends JobSearch {
  jobPosts: JobPostForCandidate[]
  pagination: JobSearchPagination
}

interface JobSearchDetailsProps {
  initialJobSearch: JobSearchWithPosts
}

export function JobSearchDetails({ initialJobSearch }: JobSearchDetailsProps) {
  // State variables
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [currentPage, setCurrentPage] = useState(
    initialJobSearch.pagination?.currentPage ?? 1,
  )
  const [showAddJobPostModal, setShowAddJobPostModal] = useState(false)
  const [showUploadCsvModal, setShowUploadCsvModal] = useState(false)
  const [editingJobPost, setEditingJobPost] =
    useState<JobPostForCandidate | null>(null)

  // Fetch job search data with pagination
  const {
    data: jobSearchData,
    isLoading,
    refetch,
  } = api.jobSearch.getJobSearch.useQuery(
    {
      id: initialJobSearch.id,
      page: currentPage,
      pageSize: initialJobSearch.pagination?.pageSize ?? 10,
    },
    {
      // Use type assertion for initialData to satisfy TypeScript
      initialData: initialJobSearch as any,
      refetchOnWindowFocus: false,
    },
  )

  // Mutations
  const { mutate: updateJobSearch } = api.jobSearch.updateJobSearch.useMutation(
    {
      onSuccess: () => {
        setIsEditing(false)
        setIsUpdating(false)
        void refetch()
      },
    },
  )

  // Job search data with type safety
  const jobSearch = jobSearchData as JobSearchWithPosts
  const jobPosts = (jobSearchData?.jobPosts ?? []) as JobPostForCandidate[]
  const pagination = (jobSearchData?.pagination ??
    initialJobSearch.pagination) as JobSearchPagination

  // Handle updating job search
  const handleUpdateJobSearch: FormProps<
    typeof JobSearchEditSchema
  >['onSubmit'] = async (values) => {
    setIsUpdating(true)
    try {
      updateJobSearch({
        id: jobSearch.id,
        name: values.name,
        startDate: values.startDate ? new Date(values.startDate) : undefined,
        isActive: values.isActive,
      })
      return {}
    } catch (error) {
      console.error('Failed to update job search', error)
      setIsUpdating(false)
      return {
        [FORM_ERROR]:
          (error as TRPCClientErrorLike<any>).message ??
          'Failed to update job search',
      }
    }
  }

  // Handle downloading CSV of round-level data
  const handleDownloadRoundLevelCsv = async () => {
    try {
      // Implementation would go here
      alert('CSV download functionality will be implemented soon!')
    } catch (error) {
      console.error('Failed to download CSV', error)
      alert('Failed to download CSV')
    }
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="p-2 sm:px-4 sm:py-6">
      {/* Job Search Header */}
      {!isEditing ? (
        <JobSearchHeader
          jobSearch={jobSearch}
          onEditClick={() => setIsEditing(true)}
          handleDownloadRoundLevelCsv={handleDownloadRoundLevelCsv}
        />
      ) : (
        <JobSearchEditForm
          jobSearch={jobSearch}
          isUpdating={isUpdating}
          onSubmit={handleUpdateJobSearch}
          onCancel={() => setIsEditing(false)}
        />
      )}

      {/* Action buttons */}
      <div className="my-6 flex flex-wrap gap-2">
        <button
          onClick={() => setShowAddJobPostModal(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          Add Job Application
        </button>
        <button
          onClick={() => setShowUploadCsvModal(true)}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          Upload CSV
        </button>
      </div>

      {/* Job Posts List */}
      <JobPostList
        jobSearch={jobSearch}
        jobPosts={jobPosts}
        currentPage={currentPage}
        pageSize={pagination.pageSize}
        totalPages={pagination.totalPages}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onEditJobPost={setEditingJobPost}
      />

      {/* Modals */}
      {showAddJobPostModal && (
        <AddJobPostModal
          jobSearchId={jobSearch.id}
          onClose={() => setShowAddJobPostModal(false)}
          onSuccess={() => {
            setShowAddJobPostModal(false)
            void refetch()
          }}
        />
      )}

      {editingJobPost && (
        <EditJobPostModal
          jobPost={editingJobPost}
          onClose={() => setEditingJobPost(null)}
          onSuccess={() => {
            setEditingJobPost(null)
            void refetch()
          }}
        />
      )}

      {showUploadCsvModal && (
        <UploadCsvModal
          jobSearchId={jobSearch.id}
          onClose={() => setShowUploadCsvModal(false)}
          onSuccess={() => {
            setShowUploadCsvModal(false)
            void refetch()
          }}
        />
      )}
    </div>
  )
}

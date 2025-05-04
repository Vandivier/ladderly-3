'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '~/trpc/react'
import { JobSearchActiveSpan } from '../JobSearchActiveSpan'
import { AddJobApplicationModal } from './AddJobApplicationModal'
import {
  Pencil,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Eye,
  Download,
  Upload,
} from 'lucide-react'
import { z } from 'zod'
import type {
  JobSearch,
  JobApplicationStatus,
  JobPostForCandidate,
  JobSearchStep,
  JobSearchStepKind,
} from '@prisma/client'
import Link from 'next/link'
import { Form, FORM_ERROR, type FormProps } from '~/app/core/components/Form'
import LabeledTextField from '~/app/core/components/LabeledTextField'
import LabeledCheckboxField from '~/app/core/components/LabeledCheckboxField'
import LabeledDateField from '~/app/core/components/LabeledDateField'
import Papa from 'papaparse'

// Helper to format date to YYYY-MM-DD
const formatDateForInput = (date: Date | string | undefined | null): string => {
  if (!date) return ''
  try {
    return new Date(date).toISOString().split('T')[0] ?? ''
  } catch (e) {
    return ''
  }
}

// Helper to format locale date
const formatLocaleDate = (date: Date | string | undefined | null): string => {
  if (!date) return 'N/A'
  try {
    return new Date(date).toLocaleDateString()
  } catch (e) {
    return 'Invalid Date'
  }
}

// Schema for editing the Job Search name
const JobSearchEditSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty'),
  startDate: z.string().min(1, 'Start date cannot be empty'),
  isActive: z.boolean(),
})
type JobSearchEditValues = z.infer<typeof JobSearchEditSchema>

// Define the expected shape of a Job Post within the list
type JobPostWithSteps = JobPostForCandidate & {
  jobSearchSteps: JobSearchStep[]
}

interface JobSearchDetailsProps {
  initialJobSearch: JobSearch & { jobPosts: JobPostWithSteps[] } // Use the defined type
}

// Status Badge component
const StatusBadge = ({ status }: { status: JobApplicationStatus }) => {
  const statusStyles: Record<JobApplicationStatus, string> = {
    APPLIED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    IN_OUTREACH:
      'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
    IN_INTERVIEW:
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    OFFER_RECEIVED:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    WITHDRAWN:
      'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300',
    TIMED_OUT:
      'bg-gray-100 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400',
    // Add other valid statuses from the enum if needed
  }
  const style =
    statusStyles[status] ??
    'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300'
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${style}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  )
}

// Interface for the round-level CSV data
interface RoundLevelCsvRow {
  Company: string
  'Job Post Title': string
  'Step Date': string
  'Step Kind': string
  JobPostId?: string
  'Is Passed'?: string
  'Is In Person'?: string
  Notes?: string
  [key: string]: string | undefined
}

// CSV Upload modal component for round-level data
interface UploadRoundLevelCsvModalProps {
  jobSearchId: number
  onClose: () => void
  onSuccess: () => Promise<void>
}

const UploadRoundLevelCsvModal: React.FC<UploadRoundLevelCsvModalProps> = ({
  jobSearchId,
  onClose,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState<
    'idle' | 'parsing' | 'uploading' | 'success' | 'error'
  >('idle')

  const { mutate: uploadRoundLevelCsv } =
    api.jobSearch.csv.createRoundLevelFromCsv.useMutation({
      onSuccess: async (data) => {
        await onSuccess()
        setStatus('success')
        setTimeout(() => {
          onClose()
        }, 2000)
      },
      onError: (error: any) => {
        console.error('Upload error:', error)
        setError(error.message || 'Failed to upload CSV data')
        setStatus('error')
        setIsSubmitting(false)
      },
    })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setSelectedFile(files[0] || null)
      setError('')
      setStatus('idle')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      setError('Please select a CSV file to upload')
      return
    }

    setIsSubmitting(true)
    setStatus('parsing')
    setError('')

    Papa.parse<RoundLevelCsvRow>(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.error('CSV parsing errors:', results.errors)
          setError(
            `Error parsing CSV: ${results.errors[0]?.message || 'Unknown error'}`,
          )
          setStatus('error')
          setIsSubmitting(false)
          return
        }

        // Validate required fields
        const requiredFields = [
          'Company',
          'Job Post Title',
          'Step Date',
          'Step Kind',
        ]
        const missingFields = requiredFields.filter(
          (field) => !results.meta.fields?.includes(field),
        )

        if (missingFields.length > 0) {
          setError(
            `Missing required fields in CSV: ${missingFields.join(', ')}`,
          )
          setStatus('error')
          setIsSubmitting(false)
          return
        }

        // Process the data
        const roundLevelData = results.data.filter(
          (row) =>
            row.Company &&
            row['Job Post Title'] &&
            row['Step Date'] &&
            row['Step Kind'],
        )

        if (roundLevelData.length === 0) {
          setError('No valid data rows found in the CSV file')
          setStatus('error')
          setIsSubmitting(false)
          return
        }

        setStatus('uploading')

        // Process the data for upload
        const processedData = roundLevelData.map((row) => {
          const result = { ...row }

          // Convert JobPostId to number if present
          if (row.JobPostId) {
            // We need to handle the type within the upload function, so keep it as a string here
            result.JobPostId = row.JobPostId
          }

          return result
        })

        uploadRoundLevelCsv({
          jobSearchId,
          roundLevelData: processedData as any, // Type assertion needed due to complex CSV structure
        })
      },
      error: (error) => {
        console.error('CSV parsing failed:', error)
        setError(`Failed to read CSV file: ${error.message}`)
        setStatus('error')
        setIsSubmitting(false)
      },
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold dark:text-white">
          Upload Round-Level CSV
        </h2>

        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          Upload a CSV file containing round-level interview data. The file
          should have the following columns:
        </p>

        <div className="mb-4 overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">
                  Column
                </th>
                <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">
                  Required
                </th>
                <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-t px-2 py-1 dark:border-gray-600">
                  JobPostId
                </td>
                <td className="border-t px-2 py-1 dark:border-gray-600">No</td>
                <td className="border-t px-2 py-1 dark:border-gray-600">
                  ID of an existing job post (leave empty to create new)
                </td>
              </tr>
              <tr>
                <td className="border-t px-2 py-1 dark:border-gray-600">
                  Company
                </td>
                <td className="border-t px-2 py-1 dark:border-gray-600">Yes</td>
                <td className="border-t px-2 py-1 dark:border-gray-600">
                  Company name
                </td>
              </tr>
              <tr>
                <td className="border-t px-2 py-1 dark:border-gray-600">
                  Job Post Title
                </td>
                <td className="border-t px-2 py-1 dark:border-gray-600">Yes</td>
                <td className="border-t px-2 py-1 dark:border-gray-600">
                  Job title
                </td>
              </tr>
              <tr>
                <td className="border-t px-2 py-1 dark:border-gray-600">
                  Step Date
                </td>
                <td className="border-t px-2 py-1 dark:border-gray-600">Yes</td>
                <td className="border-t px-2 py-1 dark:border-gray-600">
                  Date of the interview step (YYYY-MM-DD)
                </td>
              </tr>
              <tr>
                <td className="border-t px-2 py-1 dark:border-gray-600">
                  Step Kind
                </td>
                <td className="border-t px-2 py-1 dark:border-gray-600">Yes</td>
                <td className="border-t px-2 py-1 dark:border-gray-600">
                  Type of step (e.g., TECHNICAL_CONVERSATION)
                </td>
              </tr>
              <tr>
                <td className="border-t px-2 py-1 dark:border-gray-600">
                  Is Passed
                </td>
                <td className="border-t px-2 py-1 dark:border-gray-600">No</td>
                <td className="border-t px-2 py-1 dark:border-gray-600">
                  TRUE/FALSE if passed or failed
                </td>
              </tr>
              <tr>
                <td className="border-t px-2 py-1 dark:border-gray-600">
                  Is In Person
                </td>
                <td className="border-t px-2 py-1 dark:border-gray-600">No</td>
                <td className="border-t px-2 py-1 dark:border-gray-600">
                  TRUE/FALSE if in-person
                </td>
              </tr>
              <tr>
                <td className="border-t px-2 py-1 dark:border-gray-600">
                  Notes
                </td>
                <td className="border-t px-2 py-1 dark:border-gray-600">No</td>
                <td className="border-t px-2 py-1 dark:border-gray-600">
                  Any notes about the step
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <label
                htmlFor="csvFile"
                className={`inline-block rounded-md border px-4 py-2 text-sm font-medium shadow-sm ${
                  isSubmitting
                    ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500'
                    : 'cursor-pointer border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {selectedFile ? 'Change CSV File' : 'Select CSV File'}
              </label>
              <input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                disabled={isSubmitting}
              />
              {selectedFile && (
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {selectedFile.name}
                </span>
              )}
            </div>
          </div>

          {error && (
            <p className="mb-4 text-sm text-red-500 dark:text-red-400">
              {error}
            </p>
          )}

          {status === 'success' && (
            <p className="mb-4 text-sm text-green-500 dark:text-green-400">
              CSV data uploaded successfully!
            </p>
          )}

          <div className="flex justify-end space-x-2 border-t border-gray-200 pt-4 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
              disabled={isSubmitting || !selectedFile}
            >
              {isSubmitting
                ? status === 'parsing'
                  ? 'Parsing...'
                  : 'Uploading...'
                : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export const JobSearchDetails: React.FC<JobSearchDetailsProps> = ({
  initialJobSearch,
}): React.ReactNode => {
  const router = useRouter()
  const [showAddApplicationModal, setShowAddApplicationModal] = useState(false)
  const [showUploadCsvModal, setShowUploadCsvModal] = useState(false)
  const [deletingJobPostId, setDeletingJobPostId] = useState<number | null>(
    null,
  )
  const [isEditing, setIsEditing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const utils = api.useUtils() // Get tRPC utils

  const {
    data: jobSearchData,
    isLoading,
    error,
    refetch,
  } = api.jobSearch.getJobSearch.useQuery(
    { id: initialJobSearch?.id, page: currentPage, pageSize },
    {
      enabled: !!initialJobSearch?.id,
    },
  )
  const jobSearch = jobSearchData
  const pagination = jobSearchData?.pagination
  const { mutate: deleteJobPost } = api.jobSearch.jobPost.delete.useMutation({
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
      },
      onError: (error) => {
        console.error('Mutation Error:', error)
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

  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleCancelClick = () => {
    setIsEditing(false)
  }

  const handleSaveSubmit: FormProps<
    typeof JobSearchEditSchema
  >['onSubmit'] = async (values) => {
    try {
      updateJobSearch({
        id: initialJobSearch.id,
        name: values.name.trim(),
        startDate: new Date(values.startDate),
        isActive: values.isActive,
      })
    } catch (error: unknown) {
      let message = 'Sorry, we had an unexpected error. Please try again.'
      if (error instanceof Error) {
        message = error.message
      }
      return {
        [FORM_ERROR]: message,
      }
    }
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

  const handleDownloadRoundLevelCsv = async () => {
    try {
      const data = await utils.jobSearch.csv.downloadRoundLevelCsv.fetch({
        jobSearchId: initialJobSearch.id,
      })

      if (!data || !data.roundLevelData || data.roundLevelData.length === 0) {
        alert('No data available to download')
        return
      }

      // Convert data to CSV format using PapaParse
      const csv = Papa.unparse(data.roundLevelData)

      // Create a blob from the CSV
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })

      // Create a download link and trigger it
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute(
        'download',
        `${data.jobSearchName || 'job-search'}-rounds.csv`,
      )
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Failed to download CSV:', error)
      alert('Failed to download CSV. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="dark:text-gray-300">Loading job search details...</div>
    )
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-500 dark:text-red-400">{error.message}</p>
        <button
          onClick={() => router.push('/job-search')}
          className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Back to Job Searches
        </button>
      </div>
    )
  }

  if (!jobSearch) {
    console.error(
      'JobSearchDetails: Query finished but no jobSearch data found for ID:',
      initialJobSearch?.id,
    )
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

  // Prepare initial values for the form (only when editing)
  const initialFormValues: JobSearchEditValues = {
    name: jobSearch.name ?? '',
    startDate: formatDateForInput(jobSearch.startDate),
    isActive: jobSearch.isActive ?? true,
  }

  return (
    <div>
      <button
        onClick={() => router.push('/job-search')}
        className="mb-4 inline-block text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
      >
        ← Back to Job Search Archive
      </button>

      <div className="mb-4 flex flex-wrap items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{jobSearch.name}</h2>
          <div className="mt-1 text-sm text-gray-500">
            {jobSearch.isActive ? (
              <span className="inline-flex items-center">
                <span className="mr-1 h-2 w-2 rounded-full bg-green-500"></span>
                Active
              </span>
            ) : (
              <span className="inline-flex items-center">
                <span className="mr-1 h-2 w-2 rounded-full bg-gray-500"></span>
                Inactive
              </span>
            )}
            <span className="mx-2">·</span>
            <span>
              Created {new Date(jobSearch.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="mt-4 flex space-x-2">
          <Link
            href={`/job-search/${jobSearch.id}/graphs`}
            className="rounded bg-blue-50 px-3 py-1 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-800/30"
          >
            View Analytics
          </Link>
          <button
            onClick={handleDownloadRoundLevelCsv}
            className="flex items-center gap-1 rounded bg-green-50 px-3 py-1 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-800/30"
          >
            <Download className="h-4 w-4" /> CSV
          </button>
          <button
            onClick={handleEditClick}
            className="rounded px-3 py-1 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Edit
          </button>
        </div>
      </div>

      {isEditing ? (
        <Form<typeof JobSearchEditSchema>
          schema={JobSearchEditSchema}
          initialValues={initialFormValues}
          onSubmit={handleSaveSubmit}
          className="mb-4 space-y-4 rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
        >
          <LabeledTextField
            name="name"
            label="Name*"
            required
            disabled={isUpdating}
            className="input-field w-full"
          />

          <div className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-3">
            <div className="md:col-span-2">
              <LabeledDateField
                name="startDate"
                label="Start Date*"
                required
                disabled={isUpdating}
                className="input-field w-full"
              />
            </div>
            <div className="flex items-end pb-1">
              <LabeledCheckboxField
                name="isActive"
                label="Active"
                disabled={isUpdating}
                className="checkbox-field"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 border-t border-gray-200 pt-4 dark:border-gray-700">
            <button
              type="button"
              onClick={handleCancelClick}
              disabled={isUpdating}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </Form>
      ) : (
        <div className="mb-4 rounded-md border border-gray-200 p-4 shadow-sm dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
              <JobSearchActiveSpan isActive={jobSearch.isActive} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Started
              </p>
              <p className="font-medium dark:text-gray-300">
                {formatDateForInput(jobSearch.startDate)
                  ? new Date(jobSearch.startDate).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
            {jobSearch.endDate && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ended
                </p>
                <p className="font-medium dark:text-gray-300">
                  {new Date(jobSearch.endDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {!isEditing && jobSearch.notes && (
        <div className="mb-4 rounded-md border border-gray-200 p-4 shadow-sm dark:border-gray-700">
          <h3 className="mb-2 text-lg font-medium dark:text-white">Notes</h3>
          <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
            {jobSearch.notes}
          </p>
        </div>
      )}

      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold dark:text-white">
            Applications ({pagination?.totalItems ?? 0})
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowUploadCsvModal(true)}
              className="flex items-center gap-1 rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
            >
              <Upload className="h-4 w-4" /> Upload Rounds
            </button>
            <button
              onClick={() => setShowAddApplicationModal(true)}
              className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Add Application
            </button>
          </div>
        </div>

        {jobSearch.jobPosts.length === 0 && pagination?.totalItems === 0 ? (
          <p className="mt-4 rounded-md border border-gray-200 bg-white p-4 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
            No applications yet. Add your first job application to get started!
          </p>
        ) : (
          <>
            <div className="mt-4 space-y-3">
              {jobSearch?.jobPosts?.map((jobPost: JobPostWithSteps) => (
                <div
                  key={jobPost.id}
                  className="relative rounded-md border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <Link
                        href={`/job-search/job-post/${jobPost.id}`}
                        className="group"
                      >
                        <h3 className="font-medium text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                          {jobPost.jobTitle}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {jobPost.company}
                        </p>
                      </Link>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Last updated: {formatLocaleDate(jobPost.updatedAt)}
                      </p>
                    </div>
                    <div className="flex w-full shrink-0 items-center justify-between gap-2 sm:w-auto sm:justify-end">
                      <StatusBadge status={jobPost.status} />
                      <Link
                        href={`/job-search/job-post/${jobPost.id}`}
                        className="rounded-md bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-200"
                        aria-label="View details"
                      >
                        <Eye className="size-4" />
                      </Link>
                      <button
                        onClick={(e) => handleDeleteJobPost(jobPost.id, e)}
                        disabled={deletingJobPostId === jobPost.id}
                        className="rounded-md bg-gray-100 p-2 text-red-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-red-900/40 dark:hover:text-red-300"
                        aria-label="Delete job post"
                      >
                        {deletingJobPostId === jobPost.id ? (
                          <div className="size-4 animate-spin rounded-full border-2 border-red-200 border-t-red-500 dark:border-red-900 dark:border-t-red-500"></div>
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1 || isLoading}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  <ChevronLeft className="-ml-1 mr-1 size-5" />
                  Previous
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === pagination.totalPages || isLoading}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
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

      {showUploadCsvModal && (
        <UploadRoundLevelCsvModal
          jobSearchId={initialJobSearch.id}
          onClose={() => setShowUploadCsvModal(false)}
          onSuccess={async () => {
            await refetch()
            setShowUploadCsvModal(false)
          }}
        />
      )}
    </div>
  )
}

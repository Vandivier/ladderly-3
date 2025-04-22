'use client'

import type { JobApplicationStatus } from '@prisma/client'
import { ArrowLeft, Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { FORM_ERROR, type FormProps } from '~/app/core/components/Form'
import { api } from '~/trpc/react'
import type { TRPCClientErrorLike } from '@trpc/client'
import {
  EditJobPostForm,
  type JobPostEditSchema,
  type JobPostEditValues,
} from './EditJobPostForm'
import { JobStepsSection } from './JobStepsSection'

// Helper to format date to YYYY-MM-DD
const formatDateForInput = (date: Date | string | undefined | null): string => {
  if (!date) return ''
  try {
    return new Date(date).toISOString().split('T')[0] ?? ''
  } catch (e) {
    return ''
  }
}

// Helper to format locale date (Keep)
const formatLocaleDate = (date: Date | string | undefined | null): string => {
  if (!date) return ''
  try {
    return new Date(date).toLocaleDateString()
  } catch (e) {
    return ''
  }
}

// Status badge component
const StatusBadge = ({ status }: { status: JobApplicationStatus }) => {
  const statusStyles: Record<JobApplicationStatus, string> = {
    APPLIED: 'bg-blue-100 text-blue-800',
    IN_OUTREACH: 'bg-cyan-100 text-cyan-800',
    IN_INTERVIEW: 'bg-indigo-100 text-indigo-800',
    OFFER_RECEIVED: 'bg-yellow-100 text-yellow-800',
    REJECTED: 'bg-red-100 text-red-800',
    WITHDRAWN: 'bg-gray-100 text-gray-800',
    TIMED_OUT: 'bg-gray-100 text-gray-500',
  }
  const style = statusStyles[status] ?? 'bg-gray-100 text-gray-800'
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${style}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  )
}

export const JobPostDetails = ({ id }: { id: number }) => {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [deletingStepId, setDeletingStepId] = useState<number | null>(null)

  const {
    data: jobPost,
    isLoading,
    error,
    refetch,
  } = api.jobSearch.jobPost.get.useQuery({ id })

  // --- Mutations ---
  const { mutate: updateJobPost, isPending: isUpdatingPost } =
    api.jobSearch.jobPost.update.useMutation({
      onSuccess: async () => {
        await refetch()
        setIsEditing(false)
      },
    })

  const { mutate: deleteStep } = api.jobSearch.jobStep.delete.useMutation({
    onSuccess: async () => {
      await refetch()
      setDeletingStepId(null)
    },
    onError: (error: TRPCClientErrorLike<any>) => {
      alert(`Error deleting step: ${error.message}`)
      setDeletingStepId(null)
    },
  })

  const { mutate: updateStatus } =
    api.jobSearch.jobPost.updateStatus.useMutation({
      onSuccess: async () => {
        await refetch()
      },
      onError: (error: TRPCClientErrorLike<any>) => {
        alert(`Error updating status: ${error.message}`)
      },
    })

  // --- Handlers ---
  const handleDeleteStep = (stepId: number) => {
    if (confirm('Are you sure you want to delete this step?')) {
      setDeletingStepId(stepId)
      deleteStep({ id: stepId })
    }
  }

  const handleStatusChange = (newStatus: JobApplicationStatus) => {
    if (!jobPost) return
    updateStatus({ id: jobPost.id, status: newStatus })
  }

  const handleEditClick = () => setIsEditing(true)
  const handleCancelClick = () => setIsEditing(false)

  // Form submission handler (passed to EditJobPostForm)
  const handleSaveSubmit: FormProps<
    typeof JobPostEditSchema
  >['onSubmit'] = async (values) => {
    try {
      // Convert date strings back to Date or null for mutation
      // Ensure payload type matches the expected input for the mutation
      // Based on `JobPostForCandidateUpdateSchema`
      const payload: {
        company?: string | undefined
        jobTitle?: string | undefined
        jobPostUrl?: string | null | undefined
        resumeVersion?: string | null | undefined
        initialOutreachDate?: Date | null | undefined
        initialApplicationDate?: Date | null | undefined
        contactName?: string | null | undefined
        contactUrl?: string | null | undefined
        hasReferral?: boolean | undefined
        isInboundOpportunity?: boolean | undefined
        notes?: string | null | undefined
        status?: JobApplicationStatus | undefined
      } = {
        company: values.company,
        jobTitle: values.jobTitle,
        jobPostUrl: values.jobPostUrl ?? null,
        resumeVersion: values.resumeVersion ?? null,
        initialOutreachDate: values.initialOutreachDate
          ? new Date(values.initialOutreachDate)
          : null,
        initialApplicationDate: values.initialApplicationDate
          ? new Date(values.initialApplicationDate)
          : null,
        contactName: values.contactName ?? null,
        contactUrl: values.contactUrl ?? null,
        hasReferral: values.hasReferral,
        isInboundOpportunity: values.isInboundOpportunity,
        notes: values.notes ?? null,
        status: values.status,
      }

      // Remove undefined keys explicitly, as backend might expect only defined optional fields
      Object.keys(payload).forEach((key) => {
        if (payload[key as keyof typeof payload] === undefined) {
          delete payload[key as keyof typeof payload]
        }
      })

      // Call mutation without await and without `as any`
      updateJobPost({ id, ...payload })
    } catch (error: unknown) {
      // Catch as unknown
      // react-final-form expects error messages to be returned in this format
      let message = 'Sorry, we had an unexpected error. Please try again.'
      if (error instanceof Error) {
        message = error.message
      }
      return {
        [FORM_ERROR]: message,
      }
    }
  }

  // --- Loading / Error / Not Found ---
  if (isLoading) {
    return <div>Loading job application details...</div>
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-500">{error.message}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 inline-block text-blue-600 hover:text-blue-800 hover:underline"
        >
          ← Go Back
        </button>
      </div>
    )
  }

  if (!jobPost) {
    return (
      <div className="text-center">
        <p>Job application not found.</p>
        <button
          onClick={() => router.push(`/job-search`)}
          className="mt-4 inline-block text-blue-600 hover:text-blue-800 hover:underline"
        >
          ← Back to Job Search Archive
        </button>
      </div>
    )
  }

  // --- Prepare Initial Values for Form ---
  const initialFormValues: Partial<JobPostEditValues> = jobPost
    ? {
        company: jobPost.company ?? '', // Provide default empty string
        jobTitle: jobPost.jobTitle ?? '', // Provide default empty string
        jobPostUrl: jobPost.jobPostUrl ?? '', // Use empty string for form
        resumeVersion: jobPost.resumeVersion ?? '', // Use empty string for form
        initialOutreachDate: formatDateForInput(jobPost.initialOutreachDate),
        initialApplicationDate: formatDateForInput(
          jobPost.initialApplicationDate,
        ),
        contactName: jobPost.contactName ?? '', // Use empty string for form
        contactUrl: jobPost.contactUrl ?? '', // Use empty string for form
        hasReferral: jobPost.hasReferral,
        isInboundOpportunity: jobPost.isInboundOpportunity,
        notes: jobPost.notes ?? '', // Use empty string for form
        status: jobPost.status,
      }
    : {}

  // --- Render Logic ---
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.push(`/job-search/${jobPost.jobSearchId}`)}
        className="inline-block text-blue-600 hover:text-blue-800 hover:underline"
      >
        <ArrowLeft className="mr-1 inline size-4" /> Back to Job Search:{' '}
        {jobPost.jobSearch.name}
      </button>

      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-4">
          <h1 className="text-2xl font-bold">{jobPost.jobTitle}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            at {jobPost.company}
          </p>
        </div>
        <button
          onClick={handleEditClick}
          className="rounded-md border border-gray-300 bg-white p-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          disabled={!jobPost}
          aria-label="Edit job application details"
        >
          <Pencil className="size-5" />
        </button>
      </div>

      {/* Edit Form or Display Details */}
      {isEditing ? (
        <EditJobPostForm
          initialValues={initialFormValues}
          onSubmit={handleSaveSubmit}
          onCancel={handleCancelClick}
          isSubmitting={isUpdatingPost}
        />
      ) : (
        <div
          id="job-post-details-main-card-container"
          className="space-y-4 rounded-md border border-gray-200 p-4 dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
            <div>
              <p className="label-text">Status</p>
              <StatusBadge status={jobPost.status} />
            </div>
            <div>
              <p className="label-text">Job Post Link</p>
              {jobPost.jobPostUrl ? (
                <a
                  href={jobPost.jobPostUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                >
                  View Post
                </a>
              ) : (
                <span className="value-na">N/A</span>
              )}
            </div>
            <div>
              <p className="label-text">Applied</p>
              <p className="value">
                {formatLocaleDate(jobPost.initialApplicationDate)}
              </p>
            </div>
            <div>
              <p className="label-text">Last Action</p>
              <p className="value">
                {formatLocaleDate(jobPost.lastActionDate)}
              </p>
            </div>
            <div>
              <p className="label-text">Resume</p>
              <p className="value">{jobPost.resumeVersion ?? 'N/A'}</p>
            </div>
            <div>
              <p className="label-text">Initial Outreach</p>
              <p className="value">
                {formatLocaleDate(jobPost.initialOutreachDate)}
              </p>
            </div>
            <div>
              <p className="label-text">Contact Name</p>
              <p className="value">{jobPost.contactName ?? 'N/A'}</p>
            </div>
            <div>
              <p className="label-text">Contact URL</p>
              {jobPost.contactUrl ? (
                <a
                  href={jobPost.contactUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                >
                  View Profile
                </a>
              ) : (
                <span className="value-na">N/A</span>
              )}
            </div>
            <div>
              <p className="label-text">Referral?</p>
              <p className="value">{jobPost.hasReferral ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="label-text">Inbound?</p>
              <p className="value">
                {jobPost.isInboundOpportunity ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
          {jobPost.notes && (
            <div className="border-t border-gray-100 pt-4 dark:border-gray-700">
              <p className="label-text">Notes</p>
              <p className="value whitespace-pre-wrap rounded bg-gray-50 p-2 dark:bg-gray-700/50">
                {jobPost.notes}
              </p>
            </div>
          )}
        </div>
      )}

      {!isEditing && (
        <JobStepsSection
          jobPostId={id}
          steps={jobPost.jobSearchSteps}
          currentStatus={jobPost.status}
          onAddStepSuccess={refetch}
          onDeleteStep={handleDeleteStep}
          onStatusChange={handleStatusChange}
          isDeletingStepId={deletingStepId}
        />
      )}
    </div>
  )
}

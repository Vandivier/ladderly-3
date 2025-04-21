'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '~/trpc/react'
import { JobSearchStepKind, JobApplicationStatus } from '@prisma/client'
import Link from 'next/link'
import {
  Pencil,
  Check,
  X,
  Trash2,
  Eye,
  CalendarDays,
  LinkIcon,
  User,
  CheckSquare,
  FileText,
  ArrowLeft,
} from 'lucide-react'

// --- Form Imports ---
import { Form, FORM_ERROR, type FormProps } from '~/app/core/components/Form'
import LabeledTextField from '~/app/core/components/LabeledTextField'
import LabeledSelectField from '~/app/core/components/LabeledSelectField'
import LabeledCheckboxField from '~/app/core/components/LabeledCheckboxField'
import { z } from 'zod'

// --- Helper & Other Components ---
import { JobStepsSection } from './JobStepsSection'
// Import the new form component and its types
import {
  EditJobPostForm,
  JobPostEditSchema,
  type JobPostEditValues,
} from './EditJobPostForm'

// Helper to format date to YYYY-MM-DD
const formatDateForInput = (date: Date | string | undefined | null): string => {
  if (!date) return ''
  try {
    return new Date(date).toISOString().split('T')[0] ?? ''
  } catch (e) {
    return ''
  }
}

// Component to create a new job search step
interface AddJobSearchStepProps {
  jobPostId: number
  currentStatus: JobApplicationStatus
  onSuccess: () => void
  onStatusChange: (newStatus: JobApplicationStatus) => void
}

const AddJobSearchStep: React.FC<AddJobSearchStepProps> = ({
  jobPostId,
  currentStatus,
  onSuccess,
  onStatusChange,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [stepKind, setStepKind] = useState<JobSearchStepKind>(
    JobSearchStepKind.OTHER,
  )
  const [date, setDate] = useState<string>(
    new Date().toISOString().substring(0, 10),
  )
  const [notes, setNotes] = useState('')
  const [isPassed, setIsPassed] = useState<boolean | null>(null)
  const [isInPerson, setIsInPerson] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { mutate: createJobSearchStep } =
    api.jobSearch.createJobSearchStep.useMutation({
      onSuccess: () => {
        // Auto-update application status based on step type and result
        updateStatusBasedOnStep(stepKind, isPassed)
        onSuccess()
        setIsOpen(false)
        resetForm()
      },
      onError: (error) => {
        console.error('Failed to create job search step:', error)
        setIsSubmitting(false)
      },
    })

  const resetForm = () => {
    setStepKind(JobSearchStepKind.OTHER)
    setDate(new Date().toISOString().substring(0, 10))
    setNotes('')
    setIsPassed(null)
    setIsInPerson(false)
    setIsSubmitting(false)
  }

  const updateStatusBasedOnStep = (
    kind: JobSearchStepKind,
    passed: boolean | null,
  ) => {
    // Logic to automatically update application status based on step type and result
    let newStatus: JobApplicationStatus | null = null

    // Define interview step kinds
    const interviewStepKinds = [
      JobSearchStepKind.BEHAVIORAL_INTERVIEW,
      JobSearchStepKind.TECHNICAL_CODE_SCREEN_MANUAL,
      JobSearchStepKind.TECHNICAL_CODE_SCREEN_AUTOMATED,
      JobSearchStepKind.SYSTEM_DESIGN,
      JobSearchStepKind.TECHNICAL_CONVERSATION,
      JobSearchStepKind.HIRING_MANAGER_CALL,
      JobSearchStepKind.PHONE_SCREEN,
      JobSearchStepKind.MULTI_ROUND_MULTI_KIND,
    ] as JobSearchStepKind[]

    // Any failed step should update to REJECTED
    if (passed === false) {
      newStatus = JobApplicationStatus.REJECTED
    }

    // If we've added an outbound message step and were previously not in outreach
    if (
      kind === JobSearchStepKind.OUTBOUND_MESSAGE &&
      currentStatus !== JobApplicationStatus.IN_OUTREACH &&
      passed !== false // Don't update if the step failed
    ) {
      newStatus = JobApplicationStatus.IN_OUTREACH
    }

    // If we added an interview step and weren't in interview phase yet
    if (
      interviewStepKinds.includes(kind) &&
      currentStatus !== JobApplicationStatus.IN_INTERVIEW &&
      passed !== false // Don't update if the step failed
    ) {
      newStatus = JobApplicationStatus.IN_INTERVIEW
    }

    // If we're doing a background check, likely getting an offer
    if (
      kind === JobSearchStepKind.BACKGROUND_OR_REFERENCE_CHECK &&
      currentStatus !== JobApplicationStatus.OFFER_RECEIVED &&
      passed !== false // Don't update if the step failed
    ) {
      newStatus = JobApplicationStatus.OFFER_RECEIVED
    }

    // If there's a status change, call the parent handler
    if (newStatus && newStatus !== currentStatus) {
      onStatusChange(newStatus)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    createJobSearchStep({
      jobPostId,
      date: new Date(date),
      kind: stepKind,
      notes: notes ?? undefined,
      isPassed: isPassed ?? undefined,
      isInPerson,
    })
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="mt-4 w-full rounded-md border border-blue-500 px-4 py-2 text-blue-500 hover:bg-blue-50"
      >
        + Add Application Step
      </button>
    )
  }

  return (
    <div className="mt-4 rounded-md border border-gray-200 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium">Add Application Step</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">Step Type</label>
          <select
            value={stepKind}
            onChange={(e) => setStepKind(e.target.value as JobSearchStepKind)}
            className="w-full rounded-md border border-gray-300 p-2"
            required
          >
            {Object.values(JobSearchStepKind).map((kind) => (
              <option key={kind} value={kind}>
                {kind.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
            rows={3}
            placeholder="Add any notes about this step"
          />
        </div>

        <div className="mb-4 flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
          <div>
            <label className="mb-1 block text-sm font-medium">Result</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setIsPassed(true)}
                className={`rounded-md px-3 py-1 ${
                  isPassed === true
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Passed
              </button>
              <button
                type="button"
                onClick={() => setIsPassed(false)}
                className={`rounded-md px-3 py-1 ${
                  isPassed === false
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Failed
              </button>
              <button
                type="button"
                onClick={() => setIsPassed(null)}
                className={`rounded-md px-3 py-1 ${
                  isPassed === null
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Pending
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isInPerson"
              checked={isInPerson}
              onChange={(e) => setIsInPerson(e.target.checked)}
              className="size-4 rounded border-gray-300"
            />
            <label htmlFor="isInPerson" className="ml-2 text-sm font-medium">
              In Person
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Add Step'}
          </button>
        </div>
      </form>
    </div>
  )
}

// Status badge component
const StatusBadge = ({ status }: { status: JobApplicationStatus }) => {
  // Restore explicit Record type
  const statusStyles: Record<JobApplicationStatus, string> = {
    APPLIED: 'bg-blue-100 text-blue-800',
    IN_OUTREACH: 'bg-cyan-100 text-cyan-800',
    IN_INTERVIEW: 'bg-indigo-100 text-indigo-800',
    OFFER_RECEIVED: 'bg-yellow-100 text-yellow-800',
    REJECTED: 'bg-red-100 text-red-800',
    WITHDRAWN: 'bg-gray-100 text-gray-800',
    TIMED_OUT: 'bg-gray-100 text-gray-500',
    // Removed other invalid keys above
  }
  // Restore direct index access
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
  } = api.jobSearch.getJobPost.useQuery({ id })

  // --- Mutations ---
  const { mutate: updateJobPost, isPending: isUpdatingPost } =
    api.jobSearch.updateJobPost.useMutation({
      onSuccess: async () => {
        await refetch()
        setIsEditing(false)
      },
    })

  const { mutate: deleteStep, isPending: isDeletingStep } =
    api.jobSearch.deleteJobSearchStep.useMutation({
      onSuccess: async () => {
        await refetch()
        setDeletingStepId(null)
      },
      onError: (error) => {
        alert(`Error deleting step: ${error.message}`)
        setDeletingStepId(null)
      },
    })

  const { mutate: updateStatus } =
    api.jobSearch.updateJobPostStatus.useMutation({
      onSuccess: async () => {
        await refetch()
      },
      onError: (error) => {
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
      const payload = {
        ...values,
        // Ensure nullable fields are handled correctly
        jobPostUrl: values.jobPostUrl || null,
        resumeVersion: values.resumeVersion || null,
        initialOutreachDate: values.initialOutreachDate
          ? new Date(values.initialOutreachDate)
          : null,
        initialApplicationDate: values.initialApplicationDate
          ? new Date(values.initialApplicationDate)
          : null,
        contactName: values.contactName || null,
        contactUrl: values.contactUrl || null,
        notes: values.notes || null,
      }
      // Remove undefined values potentially introduced by optional fields
      // Although the backend might handle this, explicit removal is safer
      Object.keys(payload).forEach((key) => {
        if (payload[key as keyof typeof payload] === undefined) {
          delete payload[key as keyof typeof payload]
        }
      })

      await updateJobPost({ id, ...(payload as any) }) // Use payload
    } catch (error: any) {
      // react-final-form expects error messages to be returned in this format
      return {
        [FORM_ERROR]:
          error.message ??
          'Sorry, we had an unexpected error. Please try again.',
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

      {/* Header & Edit Toggle */}
      <div className="flex items-start justify-between">
        <div className="flex flex-1 items-center gap-2 pr-4">
          <div className="flex-1">
            {!isEditing ? (
              <>
                <h1 className="text-2xl font-bold">{jobPost.jobTitle}</h1>
                <p className="text-lg text-gray-600">{jobPost.company}</p>
              </>
            ) : (
              <h1 className="text-2xl font-bold">Editing Application</h1>
            )}
          </div>
          {!isEditing && (
            <button
              onClick={handleEditClick}
              className="self-baseline p-2 text-gray-500 hover:text-gray-700"
              aria-label="Edit job application details"
            >
              <Pencil className="size-5" />
            </button>
          )}
        </div>
      </div>

      {/* --- Edit Form or Display Details --- */}
      {isEditing ? (
        <EditJobPostForm
          initialValues={initialFormValues}
          onSubmit={handleSaveSubmit}
          onCancel={handleCancelClick}
          isSubmitting={isUpdatingPost} // Pass the mutation pending state
        />
      ) : (
        /* --- Display Mode Details (Refactored for clarity) --- */
        <div className="space-y-4 rounded-md border border-gray-200 p-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 md:grid-cols-3 lg:grid-cols-4">
            {/* Use consistent styling classes */}
            <div>
              <p className="label-text">Status</p>{' '}
              <StatusBadge status={jobPost.status} />
            </div>
            <div>
              <p className="label-text">Job Post Link</p>{' '}
              {jobPost.jobPostUrl ? (
                <a
                  href={jobPost.jobPostUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link inline-flex items-center"
                >
                  <LinkIcon className="mr-1 size-4" /> View Post
                </a>
              ) : (
                <span className="value-na">N/A</span>
              )}
            </div>
            <div>
              <p className="label-text">Resume</p>{' '}
              <p className="value">
                <FileText className="mr-1 inline size-4" />{' '}
                {jobPost.resumeVersion ?? 'N/A'}
              </p>
            </div>
            <div>
              <p className="label-text">Initial Outreach</p>{' '}
              <p className="value">
                <CalendarDays className="mr-1 inline size-4" />{' '}
                {jobPost.initialOutreachDate
                  ? new Date(jobPost.initialOutreachDate).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="label-text">Applied</p>{' '}
              <p className="value">
                <CalendarDays className="mr-1 inline size-4" />{' '}
                {jobPost.initialApplicationDate
                  ? new Date(
                      jobPost.initialApplicationDate,
                    ).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="label-text">Last Action</p>{' '}
              <p className="value">
                <CalendarDays className="mr-1 inline size-4" />{' '}
                {jobPost.lastActionDate
                  ? new Date(jobPost.lastActionDate).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="label-text">Contact Name</p>{' '}
              <p className="value">
                <User className="mr-1 inline size-4" />{' '}
                {jobPost.contactName ?? 'N/A'}
              </p>
            </div>
            <div>
              <p className="label-text">Contact URL</p>{' '}
              {jobPost.contactUrl ? (
                <a
                  href={jobPost.contactUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link inline-flex items-center"
                >
                  <LinkIcon className="mr-1 size-4" /> View Profile
                </a>
              ) : (
                <span className="value-na">N/A</span>
              )}
            </div>
            <div>
              <p className="label-text">Referral?</p>{' '}
              <p className="value">
                <CheckSquare className="mr-1 inline size-4" />{' '}
                {jobPost.hasReferral ? 'Yes' : 'No'}
              </p>
            </div>
            <div>
              <p className="label-text">Inbound?</p>{' '}
              <p className="value">
                <CheckSquare className="mr-1 inline size-4" />{' '}
                {jobPost.isInboundOpportunity ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
          {jobPost.notes && (
            <div className="border-t border-gray-100 pt-4">
              <p className="label-text">Notes</p>
              <p className="value whitespace-pre-wrap rounded bg-gray-50 p-2">
                {jobPost.notes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* --- Job Search Steps Section --- */}
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

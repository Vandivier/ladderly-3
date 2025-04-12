'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '~/trpc/react'
import { JobSearchStepKind, JobApplicationStatus } from '@prisma/client'
import Link from 'next/link'

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
  const getStatusColor = (status: JobApplicationStatus) => {
    switch (status) {
      case JobApplicationStatus.APPLIED:
        return 'bg-blue-100 text-blue-800'
      case JobApplicationStatus.IN_INTERVIEW:
        return 'bg-purple-100 text-purple-800'
      case JobApplicationStatus.IN_OUTREACH:
        return 'bg-yellow-100 text-yellow-800'
      case JobApplicationStatus.OFFER_RECEIVED:
        return 'bg-green-100 text-green-800'
      case JobApplicationStatus.REJECTED:
        return 'bg-red-100 text-red-800'
      case JobApplicationStatus.TIMED_OUT:
        return 'bg-gray-100 text-gray-800'
      case JobApplicationStatus.WITHDRAWN:
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(status)}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  )
}

export const JobPostDetails = ({ id }: { id: number }) => {
  const router = useRouter()
  const [deletingStepId, setDeletingStepId] = useState<number | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const {
    data: jobPost,
    isLoading,
    error,
    refetch,
  } = api.jobSearch.getJobPost.useQuery({ id })

  const { mutate: deleteJobSearchStep } =
    api.jobSearch.deleteJobSearchStep.useMutation({
      onSuccess: async () => {
        await refetch()
        setDeletingStepId(null)
      },
    })

  const { mutate: updateJobPostStatus } =
    api.jobSearch.updateJobPostStatus.useMutation({
      onSuccess: async () => {
        await refetch()
        setIsUpdatingStatus(false)
      },
      onError: (error) => {
        console.error('Failed to update job status:', error)
        setIsUpdatingStatus(false)
      },
    })

  const handleDeleteStep = (stepId: number) => {
    if (confirm('Are you sure you want to delete this step?')) {
      setDeletingStepId(stepId)
      void deleteJobSearchStep({ id: stepId })
    }
  }

  const handleStatusChange = (newStatus: JobApplicationStatus) => {
    if (!jobPost) return

    setIsUpdatingStatus(true)
    void updateJobPostStatus({
      id: jobPost.id,
      status: newStatus,
    })
  }

  if (isLoading) {
    return <div>Loading job application details...</div>
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

  if (!jobPost) {
    return (
      <div className="text-center">
        <p>Job application not found</p>
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
        <div>
          <h1 className="text-2xl font-bold">{jobPost.jobTitle}</h1>
          <p className="text-lg text-gray-600">{jobPost.company}</p>
        </div>
        <div className="flex space-x-2">
          <Link
            href={`/job-search/${jobPost.jobSearchId}`}
            className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
          >
            Back to Job Search
          </Link>
        </div>
      </div>

      <div className="mb-6 rounded-md border border-gray-200 p-4">
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          {/* First row - Status */}
          <div>
            <div className="mb-2 flex items-center space-x-2">
              <span className="text-sm text-gray-500">Status</span>
            </div>
            <div className="mb-2 flex items-center space-x-2">
              <StatusBadge status={jobPost.status} />
            </div>
            <select
              value={jobPost.status}
              onChange={(e) =>
                handleStatusChange(e.target.value as JobApplicationStatus)
              }
              disabled={isUpdatingStatus}
              className="w-full rounded-md border border-gray-300 p-1.5 text-sm"
            >
              {Object.values(JobApplicationStatus).map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Dates section */}
          <div className="xs:grid-cols-2 grid grid-cols-1 gap-4">
            {jobPost.initialApplicationDate && (
              <div>
                <p className="mb-1 text-sm text-gray-500">Applied Date</p>
                <p className="truncate font-medium">
                  {new Date(
                    jobPost.initialApplicationDate,
                  ).toLocaleDateString()}
                </p>
              </div>
            )}

            {jobPost.lastActionDate && (
              <div>
                <p className="mb-1 text-sm text-gray-500">Last Action</p>
                <p className="truncate font-medium">
                  {new Date(jobPost.lastActionDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Second row - Referral and Inbound */}
          <div>
            <p className="mb-1 text-sm text-gray-500">Referral</p>
            <p className="font-medium">{jobPost.hasReferral ? 'Yes' : 'No'}</p>
          </div>

          <div>
            <p className="mb-1 text-sm text-gray-500">Inbound Opportunity</p>
            <p className="font-medium">
              {jobPost.isInboundOpportunity ? 'Yes' : 'No'}
            </p>
          </div>

          {/* Additional information - Stacked with flex-wrap by default, 2 columns on larger screens */}
          <div className="col-span-1 sm:col-span-2">
            <div className="-mx-2 flex flex-wrap">
              {jobPost.resumeVersion && (
                <div className="mb-4 w-full px-2 sm:w-1/2 md:w-1/3 lg:w-1/4">
                  <p className="mb-1 text-sm text-gray-500">Resume Version</p>
                  <p className="truncate font-medium">
                    {jobPost.resumeVersion}
                  </p>
                </div>
              )}

              {jobPost.jobPostUrl && (
                <div className="mb-4 w-full px-2 sm:w-1/2 md:w-1/3 lg:w-1/4">
                  <p className="mb-1 text-sm text-gray-500">Job Post URL</p>
                  <a
                    href={jobPost.jobPostUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate font-medium text-blue-500 hover:underline"
                  >
                    View Job Post
                  </a>
                </div>
              )}

              {jobPost.contactName && (
                <div className="mb-4 w-full px-2 sm:w-1/2 md:w-1/3 lg:w-1/4">
                  <p className="mb-1 text-sm text-gray-500">Contact</p>
                  <p className="truncate font-medium">{jobPost.contactName}</p>
                </div>
              )}

              {jobPost.contactUrl && (
                <div className="mb-4 w-full px-2 sm:w-1/2 md:w-1/3 lg:w-1/4">
                  <p className="mb-1 text-sm text-gray-500">Contact URL</p>
                  <a
                    href={jobPost.contactUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate font-medium text-blue-500 hover:underline"
                  >
                    View Contact
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {jobPost.notes && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <p className="mb-1 text-sm text-gray-500">Notes</p>
            <p className="whitespace-pre-wrap">{jobPost.notes}</p>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h2 className="mb-4 text-xl font-semibold">Application Steps</h2>

        {jobPost.jobSearchSteps.length === 0 ? (
          <p className="text-gray-500">No application steps recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {jobPost.jobSearchSteps
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime(),
              )
              .map((step) => (
                <div
                  key={step.id}
                  className="rounded-md border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">
                          {step.kind.replace(/_/g, ' ')}
                        </h3>
                        {step.isInPerson && (
                          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                            In Person
                          </span>
                        )}
                        {step.isPassed !== null && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              step.isPassed
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {step.isPassed ? 'Passed' : 'Failed'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(step.date).toLocaleDateString()}
                      </p>
                      {step.notes && (
                        <p className="mt-2 whitespace-pre-wrap text-sm">
                          {step.notes}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteStep(step.id)}
                      disabled={deletingStepId === step.id}
                      className="rounded p-1 text-red-500 hover:bg-red-50 disabled:opacity-50"
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
              ))}
          </div>
        )}

        <AddJobSearchStep
          jobPostId={id}
          currentStatus={jobPost.status}
          onSuccess={refetch}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import type { JobSearchStepKind, JobApplicationStatus } from '@prisma/client'
import { api } from '~/trpc/react'

// --- Props Interface ---
interface AddJobSearchStepFormProps {
  jobPostId: number
  currentStatus: JobApplicationStatus
  onSuccess: () => void
  onStatusChange: (newStatus: JobApplicationStatus) => void
}

// --- Add Step Form Component ---
export const AddJobSearchStepForm: React.FC<AddJobSearchStepFormProps> = ({
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
        onSuccess() // Call parent success handler (e.g., refetch)
        setIsOpen(false)
        resetForm()
        setIsSubmitting(false) // Reset submitting state on success
      },
      onError: (error) => {
        console.error('Failed to create job search step:', error)
        alert(`Error adding step: ${error.message}`) // Provide user feedback
        setIsSubmitting(false)
      },
    })

  const resetForm = () => {
    setStepKind(JobSearchStepKind.OTHER)
    setDate(new Date().toISOString().substring(0, 10))
    setNotes('')
    setIsPassed(null)
    setIsInPerson(false)
    // Keep isSubmitting as it is, handled by mutation callbacks
  }

  const updateStatusBasedOnStep = (
    kind: JobSearchStepKind,
    passed: boolean | null,
  ) => {
    // Logic to automatically update application status based on step type and result
    let newStatus: JobApplicationStatus | null = null

    // Define interview step kinds
    const interviewStepKinds: JobSearchStepKind[] = [
      JobSearchStepKind.BEHAVIORAL_INTERVIEW,
      JobSearchStepKind.TECHNICAL_CODE_SCREEN_MANUAL,
      JobSearchStepKind.TECHNICAL_CODE_SCREEN_AUTOMATED,
      JobSearchStepKind.SYSTEM_DESIGN,
      JobSearchStepKind.TECHNICAL_CONVERSATION,
      JobSearchStepKind.HIRING_MANAGER_CALL,
      JobSearchStepKind.PHONE_SCREEN,
      JobSearchStepKind.MULTI_ROUND_MULTI_KIND,
    ]

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
      notes: notes || undefined, // Pass undefined if empty
      isPassed: isPassed ?? undefined,
      isInPerson,
    })
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="mt-4 w-full rounded-md border border-blue-500 px-4 py-2 text-blue-500 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
      >
        + Add Application Step
      </button>
    )
  }

  return (
    <div className="mt-4 rounded-md border border-gray-200 p-4 dark:border-gray-700">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Add Application Step
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          aria-label="Close add step form"
        >
          {/* Using a simple X icon from lucide-react could be an option too */}
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

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step Type Select */}
        <div>
          <label
            htmlFor="stepKind"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Step Type*
          </label>
          <select
            id="stepKind"
            value={stepKind}
            onChange={(e) => setStepKind(e.target.value as JobSearchStepKind)}
            className="w-full rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            required
            disabled={isSubmitting}
          >
            {Object.values(JobSearchStepKind).map((kind) => (
              <option key={kind} value={kind}>
                {kind
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        {/* Date Input */}
        <div>
          <label
            htmlFor="stepDate"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Date*
          </label>
          <input
            id="stepDate"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Notes Textarea */}
        <div>
          <label
            htmlFor="stepNotes"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Notes
          </label>
          <textarea
            id="stepNotes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            rows={3}
            placeholder="Add any notes about this step"
            disabled={isSubmitting}
          />
        </div>

        {/* Result & In-Person Options */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
          {/* Result Buttons */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Result
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setIsPassed(true)}
                disabled={isSubmitting}
                className={`rounded-md px-3 py-1 text-sm ${isPassed === true ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'}`}
              >
                Passed
              </button>
              <button
                type="button"
                onClick={() => setIsPassed(false)}
                disabled={isSubmitting}
                className={`rounded-md px-3 py-1 text-sm ${isPassed === false ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'}`}
              >
                Failed
              </button>
              <button
                type="button"
                onClick={() => setIsPassed(null)}
                disabled={isSubmitting}
                className={`rounded-md px-3 py-1 text-sm ${isPassed === null ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'}`}
              >
                Pending
              </button>
            </div>
          </div>

          {/* In-Person Checkbox */}
          <div className="flex items-center pt-5 sm:pt-0">
            <input
              type="checkbox"
              id="isInPerson"
              checked={isInPerson}
              onChange={(e) => setIsInPerson(e.target.checked)}
              disabled={isSubmitting}
              className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-800"
            />
            <label
              htmlFor="isInPerson"
              className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              In Person
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 border-t border-gray-200 pt-4 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
            className="btn-secondary" // Assuming standard button classes exist
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary disabled:opacity-70" // Assuming standard button classes exist
          >
            {isSubmitting ? 'Adding Step...' : 'Add Step'}
          </button>
        </div>
      </form>
    </div>
  )
}

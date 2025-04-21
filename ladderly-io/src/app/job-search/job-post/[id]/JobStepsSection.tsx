'use client'

import React, { useState } from 'react'
import { api } from '~/trpc/react'
import {
  JobSearchStepKind,
  JobApplicationStatus,
  JobSearchStep,
} from '@prisma/client'
import { Trash2, X } from 'lucide-react'

// Re-define AddJobSearchStepProps if it's not imported from elsewhere
interface AddJobSearchStepProps {
  jobPostId: number
  currentStatus: JobApplicationStatus
  onSuccess: () => void
  onStatusChange: (newStatus: JobApplicationStatus) => void
}

// --- AddJobSearchStep Component (Moved here or keep imported if preferred) ---
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
  const [isSubmittingStep, setIsSubmittingStep] = useState(false)

  const { mutate: createJobSearchStep } =
    api.jobSearch.createJobSearchStep.useMutation({
      onSuccess: () => {
        updateStatusBasedOnStep(stepKind, isPassed)
        onSuccess()
        setIsOpen(false)
        resetForm()
      },
      onError: (error) => {
        console.error('Failed to create job search step:', error)
        alert(`Error adding step: ${error.message}`) // Alert user
        setIsSubmittingStep(false)
      },
      onMutate: () => {
        setIsSubmittingStep(true)
      },
    })

  const resetForm = () => {
    setStepKind(JobSearchStepKind.OTHER)
    setDate(new Date().toISOString().substring(0, 10))
    setNotes('')
    setIsPassed(null)
    setIsInPerson(false)
    setIsSubmittingStep(false)
  }

  const updateStatusBasedOnStep = (
    kind: JobSearchStepKind,
    passed: boolean | null,
  ) => {
    let newStatus: JobApplicationStatus | null = null
    const interviewStepKinds: JobSearchStepKind[] = [
      /* ... Same as before ... */ JobSearchStepKind.BEHAVIORAL_INTERVIEW,
      JobSearchStepKind.TECHNICAL_CODE_SCREEN_MANUAL,
      JobSearchStepKind.TECHNICAL_CODE_SCREEN_AUTOMATED,
      JobSearchStepKind.SYSTEM_DESIGN,
      JobSearchStepKind.TECHNICAL_CONVERSATION,
      JobSearchStepKind.HIRING_MANAGER_CALL,
      JobSearchStepKind.PHONE_SCREEN,
      JobSearchStepKind.MULTI_ROUND_MULTI_KIND,
    ]
    if (passed === false) newStatus = JobApplicationStatus.REJECTED
    if (
      kind === JobSearchStepKind.OUTBOUND_MESSAGE &&
      currentStatus !== JobApplicationStatus.IN_OUTREACH &&
      passed !== false
    )
      newStatus = JobApplicationStatus.IN_OUTREACH
    if (
      interviewStepKinds.includes(kind) &&
      currentStatus !== JobApplicationStatus.IN_INTERVIEW &&
      passed !== false
    )
      newStatus = JobApplicationStatus.IN_INTERVIEW
    if (
      kind === JobSearchStepKind.BACKGROUND_OR_REFERENCE_CHECK &&
      currentStatus !== JobApplicationStatus.OFFER_RECEIVED &&
      passed !== false
    )
      newStatus = JobApplicationStatus.OFFER_RECEIVED
    if (newStatus && newStatus !== currentStatus) onStatusChange(newStatus)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createJobSearchStep({
      jobPostId,
      date: new Date(date),
      kind: stepKind,
      notes: notes || undefined,
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

  // --- Add Step Form JSX (Same as before) ---
  return (
    <div className="mt-4 rounded-md border border-gray-200 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium">Add Application Step</h3>
        <button
          onClick={() => {
            setIsOpen(false)
            resetForm()
          }}
          className="text-gray-500 hover:text-gray-700"
          disabled={isSubmittingStep}
        >
          <X className="size-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step Type */}
        <div>
          <label
            htmlFor={`step-kind-${jobPostId}`}
            className="mb-1 block text-sm font-medium"
          >
            Step Type*
          </label>
          <select
            id={`step-kind-${jobPostId}`}
            value={stepKind}
            onChange={(e) => setStepKind(e.target.value as JobSearchStepKind)}
            className="input-field"
            required
            disabled={isSubmittingStep}
          >
            {Object.values(JobSearchStepKind).map((kind) => (
              <option key={kind} value={kind}>
                {kind.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
        {/* Date */}
        <div>
          <label
            htmlFor={`step-date-${jobPostId}`}
            className="mb-1 block text-sm font-medium"
          >
            Date*
          </label>
          <input
            id={`step-date-${jobPostId}`}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-field"
            required
            disabled={isSubmittingStep}
          />
        </div>
        {/* Notes */}
        <div>
          <label
            htmlFor={`step-notes-${jobPostId}`}
            className="mb-1 block text-sm font-medium"
          >
            Notes
          </label>
          <textarea
            id={`step-notes-${jobPostId}`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input-field"
            rows={3}
            placeholder="Add any notes about this step"
            disabled={isSubmittingStep}
          />
        </div>
        {/* Result & In Person */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <label className="mb-1 block text-sm font-medium">Result</label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Passed', value: true },
                { label: 'Failed', value: false },
                { label: 'Pending', value: null },
              ].map((res) => (
                <button
                  key={String(res.value)}
                  type="button"
                  onClick={() => setIsPassed(res.value)}
                  disabled={isSubmittingStep}
                  className={`rounded-md px-3 py-1 text-sm transition-colors disabled:opacity-50 ${isPassed === res.value ? (res.value === true ? 'bg-green-600 text-white' : res.value === false ? 'bg-red-600 text-white' : 'bg-blue-600 text-white') : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {res.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center pt-5">
            <input
              id={`step-inperson-${jobPostId}`}
              type="checkbox"
              checked={isInPerson}
              onChange={(e) => setIsInPerson(e.target.checked)}
              className="checkbox-field mr-2"
              disabled={isSubmittingStep}
            />
            <label
              htmlFor={`step-inperson-${jobPostId}`}
              className="text-sm font-medium"
            >
              In Person?
            </label>
          </div>
        </div>
        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmittingStep}
          >
            {isSubmittingStep ? 'Adding Step...' : 'Add Step'}
          </button>
        </div>
      </form>
    </div>
  )
}

// --- New JobStepsSection Component ---
interface JobStepsSectionProps {
  jobPostId: number
  steps: JobSearchStep[] // Pass the steps array
  currentStatus: JobApplicationStatus
  onAddStepSuccess: () => void
  onDeleteStep: (stepId: number) => void
  onStatusChange: (newStatus: JobApplicationStatus) => void
  isDeletingStepId: number | null // Pass deleting state
}

export const JobStepsSection: React.FC<JobStepsSectionProps> = ({
  jobPostId,
  steps,
  currentStatus,
  onAddStepSuccess,
  onDeleteStep,
  onStatusChange,
  isDeletingStepId,
}) => {
  // Get the isPending state from the delete mutation hook
  const { isPending: isDeletingStep } =
    api.jobSearch.deleteJobSearchStep.useMutation()

  return (
    <div className="border-t border-gray-200 pt-6">
      <h3 className="mb-4 text-lg font-semibold">Application Steps</h3>
      {steps.length === 0 ? (
        <p className="text-gray-500">No steps recorded yet.</p>
      ) : (
        <ul className="space-y-3">
          {steps.map((step) => (
            <li
              key={step.id}
              className="rounded border border-gray-100 p-3 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{step.kind.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(step.date).toLocaleDateString()}
                  </p>
                  {step.notes && (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-gray-500">
                      {step.notes}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    Result:{' '}
                    {step.isPassed === true ? (
                      <span className="text-green-600">Passed</span>
                    ) : step.isPassed === false ? (
                      <span className="text-red-600">Failed</span>
                    ) : (
                      'Pending'
                    )}
                    {step.isInPerson && ' (In Person)'}
                  </p>
                </div>
                <button
                  onClick={() => onDeleteStep(step.id)}
                  disabled={isDeletingStepId === step.id || isDeletingStep}
                  className="ml-2 rounded-full p-1 text-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  aria-label="Delete step"
                >
                  {isDeletingStepId === step.id ? (
                    <div className="size-4 animate-spin rounded-full border-2 border-red-200 border-t-red-500"></div>
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {/* Add Step Component */}
      <AddJobSearchStep
        jobPostId={jobPostId}
        currentStatus={currentStatus}
        onSuccess={onAddStepSuccess}
        onStatusChange={onStatusChange}
      />
    </div>
  )
}

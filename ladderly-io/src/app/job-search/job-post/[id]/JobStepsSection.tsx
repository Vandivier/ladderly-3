'use client'

import React, { useState } from 'react'
import { api } from '~/trpc/react'
import {
  JobSearchStepKind,
  JobApplicationStatus,
  JobSearchStep,
} from '@prisma/client'
import { Trash2, X } from 'lucide-react'

// Import the extracted form component
import { AddJobSearchStepForm } from './AddJobSearchStepForm'

// REMOVE Re-defined AddJobSearchStepProps
/*
interface AddJobSearchStepProps { ... }
*/

// REMOVE --- AddJobSearchStep Component (duplicate) ---
/*
const AddJobSearchStep: React.FC<AddJobSearchStepProps> = ({ ... }) => {
  // ... entire duplicate component logic ...
}
*/

// --- Utility Functions (Keep if used elsewhere, e.g., formatDate) ---
const formatDate = (date: Date | string | undefined | null): string => {
  if (!date) return 'N/A'
  try {
    // Use toLocaleDateString for better formatting
    return new Date(date).toLocaleDateString()
  } catch (e) {
    return 'Invalid Date'
  }
}

// --- JobStepsSection Component Definition ---
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
  // Sort steps by date, most recent first
  const sortedSteps = [...steps].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  return (
    <div className="mt-6">
      <h2 className="mb-4 text-xl font-semibold">Application Steps</h2>

      {/* Render the extracted Add Step Form */}
      <AddJobSearchStepForm
        jobPostId={jobPostId}
        currentStatus={currentStatus}
        onSuccess={onAddStepSuccess} // Pass down the success handler
        onStatusChange={onStatusChange} // Pass down the status change handler
      />

      {/* List of Existing Steps */}
      <div className="mt-4 space-y-4">
        {sortedSteps.length === 0 ? (
          <p className="text-gray-500">No application steps added yet.</p>
        ) : (
          sortedSteps.map((step) => (
            <div
              key={step.id}
              className="relative rounded-md border border-gray-200 bg-white p-4 shadow-sm transition-opacity duration-300 dark:border-gray-700 dark:bg-gray-800"
              style={{
                opacity: isDeletingStepId === step.id ? 0.5 : 1,
              }}
            >
              <button
                onClick={() => onDeleteStep(step.id)}
                disabled={isDeletingStepId === step.id}
                className="absolute right-2 top-2 p-1 text-red-400 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-500 dark:hover:text-red-400"
                aria-label="Delete step"
              >
                <Trash2 className="size-4" />
              </button>
              <div className="flex flex-col gap-y-1 md:flex-row md:items-center md:justify-between">
                <div className="font-medium text-gray-800 dark:text-gray-100">
                  {step.kind.replace(/_/g, ' ')}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(step.date)}
                </div>
              </div>
              {step.notes && (
                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300">
                  {step.notes}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                {step.isPassed !== null && (
                  <span
                    className={`font-semibold ${step.isPassed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                  >
                    {step.isPassed ? 'Passed' : 'Failed'}
                  </span>
                )}
                {step.isInPerson && (
                  <span className="text-gray-500 dark:text-gray-400">
                    (In Person)
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

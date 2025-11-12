'use client'

import type { JobSearch } from '@prisma/client'
import React from 'react'
import { z } from 'zod'
import { Form, type FormProps } from '~/app/core/components/Form'
import LabeledCheckboxField from '~/app/core/components/LabeledCheckboxField'
import LabeledDateField from '~/app/core/components/LabeledDateField'
import LabeledTextField from '~/app/core/components/LabeledTextField'

// Schema for editing the Job Search name
const JobTrackerEditSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty'),
  startDate: z.string().min(1, 'Start date cannot be empty'),
  isActive: z.boolean(),
})

type JobSearchEditValues = z.infer<typeof JobTrackerEditSchema>

// Helper to format date to YYYY-MM-DD
const formatDateForInput = (date: Date | string | undefined | null): string => {
  if (!date) return ''
  try {
    return new Date(date).toISOString().split('T')[0] ?? ''
  } catch {
    return ''
  }
}

interface JobSearchEditFormProps {
  jobSearch: JobSearch
  isUpdating: boolean
  onSubmit: FormProps<typeof JobTrackerEditSchema>['onSubmit']
  onCancel: () => void
}

export const JobSearchTrackerEditForm: React.FC<JobSearchEditFormProps> = ({
  jobSearch,
  isUpdating,
  onSubmit,
  onCancel,
}) => {
  // Prepare initial values for the form
  const initialFormValues: JobSearchEditValues = {
    name: jobSearch.name ?? '',
    startDate: formatDateForInput(jobSearch.startDate),
    isActive: jobSearch.isActive ?? true,
  }

  return (
    <Form<typeof JobTrackerEditSchema>
      schema={JobTrackerEditSchema}
      initialValues={initialFormValues}
      onSubmit={onSubmit}
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
          onClick={onCancel}
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
  )
}

export { JobTrackerEditSchema, type JobSearchEditValues }

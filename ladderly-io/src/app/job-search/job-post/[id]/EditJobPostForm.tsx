'use client'

import React from 'react'
import { z } from 'zod'
import { JobApplicationStatus } from '@prisma/client'
import { Form, type FormProps } from '~/app/core/components/Form'
import LabeledTextField from '~/app/core/components/LabeledTextField'
import LabeledSelectField from '~/app/core/components/LabeledSelectField'
import LabeledCheckboxField from '~/app/core/components/LabeledCheckboxField'
import LabeledDateField from '~/app/core/components/LabeledDateField'
import { X, Check } from 'lucide-react'

// Define Edit Schema (Client-side subset/adaptation of backend schema)
export const JobPostEditSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  jobPostUrl: z
    .string()
    .url('Must be a valid URL (e.g., https://...)')
    .nullable()
    .optional()
    .or(z.literal('')), // Allow empty string or valid URL
  resumeVersion: z.string().nullable().optional(),
  initialOutreachDate: z.string().nullable().optional(), // Keep as string for date input
  initialApplicationDate: z.string().nullable().optional(), // Keep as string for date input
  contactName: z.string().nullable().optional(),
  contactUrl: z
    .string()
    .url('Must be a valid URL (e.g., https://...)')
    .nullable()
    .optional()
    .or(z.literal('')), // Allow empty string or valid URL
  hasReferral: z.boolean().optional(),
  isInboundOpportunity: z.boolean().optional(),
  notes: z.string().nullable().optional(),
  status: z.nativeEnum(JobApplicationStatus),
})
export type JobPostEditValues = z.infer<typeof JobPostEditSchema>

// --- Props Interface ---
interface EditJobPostFormProps {
  initialValues: Partial<JobPostEditValues>
  onSubmit: FormProps<typeof JobPostEditSchema>['onSubmit']
  onCancel: () => void
  isSubmitting: boolean // Added prop to control disabled state
}

// --- Edit Form Component ---
export const EditJobPostForm: React.FC<EditJobPostFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting, // Use the passed-in submitting state
}) => {
  return (
    <Form<typeof JobPostEditSchema>
      schema={JobPostEditSchema}
      initialValues={initialValues}
      onSubmit={onSubmit}
      className="space-y-6 rounded-md border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
        <LabeledTextField
          name="company"
          label="Company*"
          required
          disabled={isSubmitting}
          className="input-field w-full"
        />
        <LabeledTextField
          name="jobTitle"
          label="Job Title*"
          required
          disabled={isSubmitting}
          className="input-field w-full"
        />
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
        <LabeledTextField
          name="jobPostUrl"
          label="Job Post URL"
          placeholder="https://..."
          disabled={isSubmitting}
          className="input-field w-full"
        />
        <LabeledTextField
          name="resumeVersion"
          label="Resume Version"
          placeholder="e.g., v3-blue"
          disabled={isSubmitting}
          className="input-field w-full"
        />
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
        <LabeledDateField
          name="initialOutreachDate"
          label="Initial Outreach"
          disabled={isSubmitting}
          className="input-field w-full"
        />
        <LabeledDateField
          name="initialApplicationDate"
          label="Applied"
          disabled={isSubmitting}
          className="input-field w-full"
        />
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
        <LabeledTextField
          name="contactName"
          label="Contact Name"
          disabled={isSubmitting}
          className="input-field w-full"
        />
        <LabeledTextField
          name="contactUrl"
          label="Contact URL"
          placeholder="https://linkedin.com/..."
          disabled={isSubmitting}
          className="input-field w-full"
        />
      </div>

      {/* Status Field - Own Row */}
      <div className="w-full">
        <LabeledSelectField
          name="status"
          label="Status*" /* className="input-field w-full" */
        >
          {Object.values(JobApplicationStatus).map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </option>
          ))}
        </LabeledSelectField>
      </div>

      {/* Booleans Row - Below Status */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 pt-2 md:grid-cols-2">
        {' '}
        {/* Use 2 columns for checkboxes */}
        <div className="flex items-center">
          {' '}
          {/* Simple flex align */}
          <LabeledCheckboxField
            name="hasReferral"
            label="Has Referral?"
            disabled={isSubmitting}
          />
        </div>
        <div className="flex items-center">
          {' '}
          {/* Simple flex align */}
          <LabeledCheckboxField
            name="isInboundOpportunity"
            label="Inbound?"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <LabeledTextField
        name="notes"
        label="Notes"
        disabled={isSubmitting}
        className="input-field w-full"
      />

      {/* Actions - Apply SettingsForm styles */}
      <div className="flex justify-end space-x-2 border-t border-gray-200 pt-6 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          // Apply standard secondary button style
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          // Apply SettingsForm primary button style
          className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </Form>
  )
}

'use client'

import React from 'react'
import { z } from 'zod'
import { JobApplicationStatus } from '@prisma/client'
import { Form, FORM_ERROR, type FormProps } from '~/app/core/components/Form'
import LabeledTextField from '~/app/core/components/LabeledTextField'
import LabeledSelectField from '~/app/core/components/LabeledSelectField'
import LabeledCheckboxField from '~/app/core/components/LabeledCheckboxField'
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
      // Removed render prop, form fields are direct children
      className="space-y-4 rounded-md border border-gray-200 bg-gray-50 p-4"
    >
      {/* Row 1: Company, Title */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <LabeledTextField
          name="company"
          label="Company*"
          placeholder="Company Name"
          required // Assuming LabeledTextField supports 'required' for styling/accessibility, validation is via Zod
          disabled={isSubmitting} // Use prop
        />
        <LabeledTextField
          name="jobTitle"
          label="Job Title*"
          placeholder="Job Title"
          required
          disabled={isSubmitting} // Use prop
        />
      </div>
      {/* Row 2: URL, Resume */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <LabeledTextField
          name="jobPostUrl"
          label="Job Post URL"
          placeholder="https://..."
          // Removed type="url"
          disabled={isSubmitting} // Use prop
        />
        <LabeledTextField
          name="resumeVersion"
          label="Resume Version"
          placeholder="e.g., v3-blue"
          disabled={isSubmitting} // Use prop
        />
      </div>
      {/* Row 3: Dates */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <LabeledTextField
          name="initialOutreachDate"
          label="Initial Outreach"
          // type="date" // Keep type="date" for browser rendering, assuming LabeledTextField passes it through
          disabled={isSubmitting} // Use prop
        />
        <LabeledTextField
          name="initialApplicationDate"
          label="Applied"
          // type="date" // Keep type="date" for browser rendering
          disabled={isSubmitting} // Use prop
        />
      </div>
      {/* Row 4: Contact */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <LabeledTextField
          name="contactName"
          label="Contact Name"
          disabled={isSubmitting} // Use prop
        />
        <LabeledTextField
          name="contactUrl"
          label="Contact URL"
          placeholder="https://linkedin.com/..."
          // Removed type="url"
          disabled={isSubmitting} // Use prop
        />
      </div>
      {/* Row 5: Status, Booleans */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <LabeledSelectField
          name="status"
          label="Status*"
          // Removed 'required' prop; Zod schema handles validation
          // Removed 'disabled' prop
          // Note: Disabling select might need specific handling if LabeledSelectField doesn't pass it
        >
          {Object.values(JobApplicationStatus).map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </option>
          ))}
        </LabeledSelectField>
        <div className="flex items-end pb-1">
          <LabeledCheckboxField
            name="hasReferral"
            label="Has Referral?"
            disabled={isSubmitting} // Use prop
          />
        </div>
        <div className="flex items-end pb-1">
          <LabeledCheckboxField
            name="isInboundOpportunity"
            label="Inbound?"
            disabled={isSubmitting} // Use prop
          />
        </div>
      </div>
      {/* Row 6: Notes */}
      <LabeledTextField
        name="notes"
        label="Notes"
        // Assuming LabeledTextField can render a textarea if props specify,
        // otherwise, might need a LabeledTextareaField or adjust LabeledTextField
        // Let's assume it handles multiline or we need another component.
        // For now, keeping as LabeledTextField.
        disabled={isSubmitting} // Use prop
        // You might need to add props like `rows={3}` if LabeledTextField supports it.
      />

      {/* Display submit errors - Form component handles this implicitly with FORM_ERROR */}
      {/* We can add a placeholder for Form.ErrorMessage if needed */}
      {/* <Form.ErrorMessage /> Component might not exist, FORM_ERROR is handled internally by Form */}

      {/* Actions */}
      <div className="flex justify-end space-x-2 border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting} // Use prop
          className="btn-secondary" // Assuming standard button classes exist
        >
          <X className="btn-icon" /> Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting} // Use prop
          className="btn-primary" // Assuming standard button classes exist
        >
          <Check className="btn-icon" />{' '}
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </Form>
  )
}

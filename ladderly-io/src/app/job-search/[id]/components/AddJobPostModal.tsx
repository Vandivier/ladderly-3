'use client'

import React, { useState } from 'react'
import { z } from 'zod'
import { api } from '~/trpc/react'
import { Form, FORM_ERROR, type FormProps } from '~/app/core/components/Form'
import LabeledTextField from '~/app/core/components/LabeledTextField'
import LabeledDateField from '~/app/core/components/LabeledDateField'
import LabeledCheckboxField from '~/app/core/components/LabeledCheckboxField'
import LabeledSelectField from '~/app/core/components/LabeledSelectField'
import { JobApplicationStatus } from '@prisma/client'
import type { TRPCClientErrorLike } from '@trpc/client'

// Create schema for adding a job post
const AddJobPostSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  jobPostUrl: z.string().url('Must be a valid URL').nullable().optional(),
  resumeVersion: z.string().nullable().optional(),
  initialApplicationDate: z.string().nullable().optional(),
  contactName: z.string().nullable().optional(),
  contactUrl: z.string().url('Must be a valid URL').nullable().optional(),
  hasReferral: z.boolean().default(false),
  isInboundOpportunity: z.boolean().default(false),
  notes: z.string().nullable().optional(),
  status: z
    .nativeEnum(JobApplicationStatus)
    .default(JobApplicationStatus.APPLIED),
})

type AddJobPostValues = z.infer<typeof AddJobPostSchema>

interface AddJobPostModalProps {
  jobSearchId: number
  onClose: () => void
  onSuccess: () => void
}

export const AddJobPostModal: React.FC<AddJobPostModalProps> = ({
  jobSearchId,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { mutate: createJobPost } = api.jobSearch.jobPost.create.useMutation({
    onSuccess: () => {
      setIsSubmitting(false)
      onSuccess()
    },
    onError: (error) => {
      console.error('Failed to create job post:', error)
      setIsSubmitting(false)
    },
  })

  const handleSubmit: FormProps<typeof AddJobPostSchema>['onSubmit'] = async (
    values,
  ) => {
    setIsSubmitting(true)
    try {
      // Handle date conversion
      const applicationDate = values.initialApplicationDate
        ? new Date(values.initialApplicationDate)
        : undefined

      createJobPost({
        jobSearchId,
        company: values.company,
        jobTitle: values.jobTitle,
        jobPostUrl: values.jobPostUrl || undefined,
        resumeVersion: values.resumeVersion || undefined,
        initialApplicationDate: applicationDate,
        contactName: values.contactName || undefined,
        contactUrl: values.contactUrl || undefined,
        hasReferral: values.hasReferral,
        isInboundOpportunity: values.isInboundOpportunity,
        notes: values.notes || undefined,
      })
      return {}
    } catch (error) {
      console.error('Error creating job post:', error)
      setIsSubmitting(false)
      return {
        [FORM_ERROR]:
          (error as TRPCClientErrorLike<any>).message ||
          'Failed to create job post',
      }
    }
  }

  // Initial values for the form
  const initialValues: AddJobPostValues = {
    company: '',
    jobTitle: '',
    jobPostUrl: '',
    resumeVersion: '',
    initialApplicationDate: new Date().toISOString().split('T')[0],
    contactName: '',
    contactUrl: '',
    hasReferral: false,
    isInboundOpportunity: false,
    notes: '',
    status: JobApplicationStatus.APPLIED,
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold dark:text-white">
          Add Job Application
        </h2>

        <Form<typeof AddJobPostSchema>
          schema={AddJobPostSchema}
          initialValues={initialValues}
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <LabeledTextField
                name="company"
                label="Company*"
                required
                placeholder="Company name"
                disabled={isSubmitting}
              />
              <LabeledTextField
                name="jobTitle"
                label="Job Title*"
                required
                placeholder="Position title"
                disabled={isSubmitting}
              />
            </div>

            <LabeledTextField
              name="jobPostUrl"
              label="Job Post URL"
              placeholder="https://..."
              disabled={isSubmitting}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <LabeledTextField
                name="resumeVersion"
                label="Resume Version"
                placeholder="e.g., v1.2"
                disabled={isSubmitting}
              />
              <LabeledDateField
                name="initialApplicationDate"
                label="Application Date"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <LabeledTextField
                name="contactName"
                label="Contact Name"
                placeholder="Recruiter/hiring manager"
                disabled={isSubmitting}
              />
              <LabeledTextField
                name="contactUrl"
                label="Contact URL"
                placeholder="e.g., LinkedIn profile"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <LabeledCheckboxField
                name="hasReferral"
                label="Has Referral"
                disabled={isSubmitting}
              />
              <LabeledCheckboxField
                name="isInboundOpportunity"
                label="Inbound Opportunity"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label
                htmlFor="status"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Status
              </label>
              <LabeledSelectField name="status" label="Status">
                {Object.values(JobApplicationStatus).map((status) => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </option>
                ))}
              </LabeledSelectField>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Notes
              </label>
              <textarea
                name="notes"
                placeholder="Additional details about this application"
                className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex justify-end space-x-2 border-t border-gray-200 pt-4 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {isSubmitting ? 'Submitting...' : 'Add Application'}
              </button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  )
}

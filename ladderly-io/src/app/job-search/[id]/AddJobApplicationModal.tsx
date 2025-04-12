'use client'

import { z } from 'zod'
import { api } from '~/trpc/react'
import { Form, FORM_ERROR, type FormProps } from '~/app/core/components/Form'
import LabeledTextField from '~/app/core/components/LabeledTextField'
import LabeledCheckboxField from '~/app/core/components/LabeledCheckboxField'

// Define schema for job application form
const JobApplicationSchema = z.object({
  company: z.string().min(1, { message: 'Company name is required' }),
  jobTitle: z.string().min(1, { message: 'Job title is required' }),
  jobPostUrl: z.string().optional(),
  resumeVersion: z.string().optional(),
  contactName: z.string().optional(),
  contactUrl: z.string().optional(),
  hasReferral: z.boolean().default(false),
  isInboundOpportunity: z.boolean().default(false),
  notes: z.string().optional(),
})

type JobApplicationFormValues = z.infer<typeof JobApplicationSchema>

interface AddJobApplicationModalProps {
  jobSearchId: number
  onClose: () => void
  onSuccess: () => void
}

export const AddJobApplicationModal = ({
  jobSearchId,
  onClose,
  onSuccess,
}: AddJobApplicationModalProps) => {
  // Create job application mutation
  const { mutate: createJobApplication } =
    api.jobSearch.createJobPostForCandidate.useMutation()

  // Initial form values
  const initialValues: JobApplicationFormValues = {
    company: '',
    jobTitle: '',
    jobPostUrl: '',
    resumeVersion: '',
    contactName: '',
    contactUrl: '',
    hasReferral: false,
    isInboundOpportunity: false,
    notes: '',
  }

  // Form submission handler
  const handleSubmit: FormProps<
    typeof JobApplicationSchema
  >['onSubmit'] = async (values) => {
    try {
      const currentDate = new Date()

      await createJobApplication({
        jobSearchId,
        ...values,
        initialApplicationDate: currentDate,
        lastActionDate: currentDate,
      })

      onSuccess()
      onClose()
      return
    } catch (error: any) {
      return {
        [FORM_ERROR]: error.message || 'Failed to create job application',
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Add New Job Application</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
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

        <Form
          schema={JobApplicationSchema}
          initialValues={initialValues}
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <LabeledTextField
              name="company"
              label="Company"
              placeholder="Company name"
              required
            />

            <LabeledTextField
              name="jobTitle"
              label="Job Title"
              placeholder="Position title"
              required
            />
          </div>

          <LabeledTextField
            name="jobUrl"
            label="Job Post URL"
            placeholder="https://company.com/jobs/123"
            outerProps={{ className: 'mt-4' }}
          />

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <LabeledTextField
              name="resumeVersion"
              label="Resume Version"
              placeholder="v1, v2, etc."
            />

            <div className="space-y-2">
              <LabeledCheckboxField
                name="hasReferral"
                label="I have a referral for this position"
              />

              <LabeledCheckboxField
                name="isInboundOpportunity"
                label="This is an inbound opportunity (recruiter reached out)"
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <LabeledTextField
              name="contactName"
              label="Contact Name"
              placeholder="Recruiter or hiring manager name"
            />

            <LabeledTextField
              name="contactUrl"
              label="Contact URL"
              placeholder="https://linkedin.com/in/contact"
            />
          </div>

          <LabeledTextField
            name="notes"
            label="Notes"
            placeholder="Any additional information about this application"
            outerProps={{ className: 'mt-4' }}
          />

          <div className="mt-6 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Add Application
            </button>
          </div>
        </Form>
      </div>
    </div>
  )
}

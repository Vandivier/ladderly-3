'use client'

import { useState } from 'react'
import { api } from '~/trpc/react'
import LabeledCheckboxField from '~/app/core/components/LabeledCheckboxField'
import { Form } from '~/app/core/components/Form'
import { z } from 'zod'

const EmailPreferencesSchema = z.object({
  isRecruiter: z.boolean(),
  hasOptOutMarketing: z.boolean(),
  hasOptOutFeatureUpdates: z.boolean(),
  hasOptOutEventAnnouncements: z.boolean(),
  hasOptOutNewsletterAndBlog: z.boolean(),
})

type EmailPreferencesFormValues = z.infer<typeof EmailPreferencesSchema>

interface EmailPreferencesFormWrapperProps {
  initialSettings: {
    id: number
    email: string
    isRecruiter: boolean
    hasOptOutMarketing: boolean
    hasOptOutFeatureUpdates: boolean
    hasOptOutEventAnnouncements: boolean
    hasOptOutNewsletterAndBlog: boolean
  }
}

export function EmailPreferencesFormWrapper({
  initialSettings,
}: EmailPreferencesFormWrapperProps) {
  const updateSettings = api.user.updateEmailPreferences.useMutation({
    onSuccess: () => {
      // You could add a success toast here
      console.log('Email preferences updated successfully')
    },
  })

  const handleSubmit = async (values: EmailPreferencesFormValues) => {
    updateSettings.mutate(values)
  }

  return (
    <Form
      schema={EmailPreferencesSchema}
      initialValues={{
        isRecruiter: initialSettings.isRecruiter,
        hasOptOutMarketing: initialSettings.hasOptOutMarketing,
        hasOptOutFeatureUpdates: initialSettings.hasOptOutFeatureUpdates,
        hasOptOutEventAnnouncements:
          initialSettings.hasOptOutEventAnnouncements,
        hasOptOutNewsletterAndBlog: initialSettings.hasOptOutNewsletterAndBlog,
      }}
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            Select which types of emails you would like to receive
          </p>
        </div>

        <div className="space-y-4">
          <LabeledCheckboxField
            name="hasOptOutMarketing"
            label="Marketing emails (product updates, promotions)"
          />

          <LabeledCheckboxField
            name="hasOptOutFeatureUpdates"
            label="Feature updates and new functionality"
          />

          <LabeledCheckboxField
            name="hasOptOutEventAnnouncements"
            label="Event announcements and invitations"
          />

          <LabeledCheckboxField
            name="hasOptOutNewsletterAndBlog"
            label="Newsletter and blog updates"
          />

          <LabeledCheckboxField
            name="isRecruiter"
            label="I'm a recruiter! Send me recruiter-specific updates and job seeker profiles"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={updateSettings.isLoading}
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        {updateSettings.isLoading ? 'Saving...' : 'Save Preferences'}
      </button>
    </Form>
  )
}

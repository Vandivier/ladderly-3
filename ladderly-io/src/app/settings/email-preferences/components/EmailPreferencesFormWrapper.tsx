'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { z } from 'zod'
import { Form } from '~/app/core/components/Form'
import LabeledCheckboxField from '~/app/core/components/LabeledCheckboxField'
import { api } from '~/trpc/react'

const EmailPreferencesSchema = z.object({
  isRecruiter: z.boolean(),
  wantsMarketing: z.boolean(),
  wantsFeatureUpdates: z.boolean(),
  wantsEventAnnouncements: z.boolean(),
  wantsNewsletterAndBlog: z.boolean(),
})

type EmailPreferencesFormSubmittedValues = z.infer<
  typeof EmailPreferencesSchema
>

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const updateSettings = api.user.updateEmailPreferences.useMutation({
    onSuccess: () => {
      setIsSubmitting(false)
      alert('Updated successfully.')
      router.refresh()
    },
    onError: (error) => {
      console.error('Failed to update settings:', error)
      alert('Update failed: ' + error.message)
    },
  })

  const handleSubmit = async (values: EmailPreferencesFormSubmittedValues) => {
    setIsSubmitting(true)
    updateSettings.mutate({
      isRecruiter: values.isRecruiter,
      hasOptOutMarketing: !values.wantsMarketing,
      hasOptOutFeatureUpdates: !values.wantsFeatureUpdates,
      hasOptOutEventAnnouncements: !values.wantsEventAnnouncements,
      hasOptOutNewsletterAndBlog: !values.wantsNewsletterAndBlog,
    })
  }

  return (
    <Form
      schema={EmailPreferencesSchema}
      initialValues={{
        isRecruiter: initialSettings.isRecruiter,
        wantsMarketing: !initialSettings.hasOptOutMarketing,
        wantsFeatureUpdates: !initialSettings.hasOptOutFeatureUpdates,
        wantsEventAnnouncements: !initialSettings.hasOptOutEventAnnouncements,
        wantsNewsletterAndBlog: !initialSettings.hasOptOutNewsletterAndBlog,
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
            name="wantsMarketing"
            label="Marketing emails (product updates, promotions)"
          />

          <LabeledCheckboxField
            name="wantsFeatureUpdates"
            label="Feature updates and new functionality"
          />

          <LabeledCheckboxField
            name="wantsEventAnnouncements"
            label="Event announcements and invitations"
          />

          <LabeledCheckboxField
            name="wantsNewsletterAndBlog"
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
        disabled={isSubmitting}
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        {isSubmitting ? 'Saving...' : 'Save Preferences'}
      </button>
    </Form>
  )
}

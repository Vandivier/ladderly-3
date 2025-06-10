'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { z } from 'zod'
import type { UpdateSettingsFormSchema } from '~/app/settings/schemas'
import {
  UpdateUserSettingsSchema,
  type UserSettingsFormValuesType,
} from '~/server/schemas'
import { api } from '~/trpc/react'
import { SettingsForm } from './SettingsForm'

// Add types for journal notification enum
const JournalNotificationOptions = ['NONE', 'DAILY', 'WEEKLY', 'MONTHLY'] as const

export function SettingsFormWrapper({
  initialSettings,
}: {
  initialSettings: UserSettingsFormValuesType
}) {
  const [settings, setSettings] =
    useState<UserSettingsFormValuesType>(initialSettings)
  const router = useRouter()

  const { mutate: updateSettings } = api.user.updateSettings.useMutation({
    onSuccess: (updatedSettings) => {
      setSettings(
        (prev: any) =>
          ({ ...prev, ...updatedSettings }) as UserSettingsFormValuesType,
      )
      alert('Updated successfully.')
      router.refresh()
    },
    onError: (error) => {
      console.error('Failed to update settings:', error)
      alert('Update failed: ' + error.message)
    },
  })

  const { mutate: updateFrequency } =
    api.user.updateJournalNotificationFrequency.useMutation({
      onSuccess: () => {
        alert('Notification preference updated.')
      },
      onError: (error) => {
        console.error('Failed to update notification frequency:', error)
        alert('Failed to update notification frequency: ' + error.message)
      },
    })

  const handleSubmit = async (values: z.infer<typeof UpdateSettingsFormSchema>) => {
    const maybeYearsOfExperience = parseInt(
      values.profileYearsOfExperience ?? '',
    )
    const profileYearsOfExperience = isNaN(maybeYearsOfExperience)
      ? null
      : maybeYearsOfExperience

    const sanitizedValues = UpdateUserSettingsSchema.parse({
      ...values,
      emailBackup: values.emailBackup ?? null,
      emailStripe: values.emailStripe ?? null,
      hasOpenToRelocation: values.hasOpenToRelocation ?? false,
      nameFirst: values.nameFirst ?? null,
      nameLast: values.nameLast ?? null,
      profileBlurb: values.profileBlurb ?? null,
      profileContactEmail: values.profileContactEmail ?? null,
      profileCurrentJobCompany: values.profileCurrentJobCompany ?? '',
      profileCurrentJobTitle: values.profileCurrentJobTitle ?? '',
      profileDiscordHandle: values.profileDiscordHandle ?? null,
      profileGitHubUri: values.profileGitHubUri ?? null,
      profileHighestDegree: values.profileHighestDegree ?? null,
      profileHomepageUri: values.profileHomepageUri ?? null,
      profileLinkedInUri: values.profileLinkedInUri ?? null,
      profileTopNetworkingReasons: values.profileTopNetworkingReasons ?? [],
      profileTopServices: values.profileTopServices ?? [],
      profileTopSkills: values.profileTopSkills ?? [],
      profileYearsOfExperience,
    })

    updateSettings(sanitizedValues)
  }

  return (
    <div>
      <SettingsForm
        initialValues={settings as unknown as z.infer<typeof UpdateSettingsFormSchema>}
        onSubmit={handleSubmit}
      />

      {/* Journal Notification Preference Section */}
      <div className="mt-6">
        <label htmlFor="notification-frequency" className="font-semibold">
          Journal Email Notifications:
        </label>
        <select
          id="notification-frequency"
          value={settings.journalNotificationFrequency}
          onChange={(e) => {
            const selected = e.target.value as (typeof JournalNotificationOptions)[number]
            setSettings((prev) => ({ ...prev, journalNotificationFrequency: selected }))
            updateFrequency({ frequency: selected })
          }}
          className="ml-2 border rounded p-1"
        >
          {JournalNotificationOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt.charAt(0) + opt.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

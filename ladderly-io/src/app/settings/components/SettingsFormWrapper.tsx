// app/settings/components/SettingsFormWrapper.tsx

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

type FormValues = z.infer<typeof UpdateSettingsFormSchema>
interface SettingsFormWrapperProps {
  initialSettings: UserSettingsFormValuesType
}

export function SettingsFormWrapper({
  initialSettings,
}: SettingsFormWrapperProps) {
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

  const handleSubmit = async (values: FormValues) => {
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
    <SettingsForm
      initialValues={settings as unknown as FormValues}
      onSubmit={handleSubmit}
    />
  )
}

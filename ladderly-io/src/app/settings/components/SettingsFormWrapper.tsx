// app/settings/SettingsForm.tsx

'use client'

import type { PaymentTierEnum } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { z } from 'zod'
import { UpdateSettingsFormSchema } from '~/app/settings/schemas'
import { UpdateUserSettingsSchema } from '~/server/schemas'
import { api } from '~/trpc/react'
import { SettingsForm } from './SettingsForm'

// Base form values from schema
type FormValues = z.infer<typeof UpdateSettingsFormSchema>

// Settings type that matches the API response
export type UserSettings = FormValues & {
  id: number
  createdAt: Date
  updatedAt: Date
  adminNotes: string
  emailVerified: Date | null
  hashedPassword: string | null
  uuid: string
  subscription: {
    type: string
    tier: PaymentTierEnum
  }
}

interface SettingsFormWrapperProps {
  initialSettings: UserSettings
}

export function SettingsFormWrapper({
  initialSettings,
}: SettingsFormWrapperProps) {
  const [settings, setSettings] = useState<UserSettings>(initialSettings)
  const router = useRouter()
  const { mutate: updateSettings } = api.user.updateSettings.useMutation({
    onSuccess: (updatedSettings) => {
      setSettings(
        (prev: any) => ({ ...prev, ...updatedSettings }) as UserSettings,
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
      nameFirst: values.nameFirst ?? null,
      nameLast: values.nameLast ?? null,
      profileBlurb: values.profileBlurb ?? null,
      profileContactEmail: values.profileContactEmail ?? null,
      profileGitHubUri: values.profileGitHubUri ?? null,
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

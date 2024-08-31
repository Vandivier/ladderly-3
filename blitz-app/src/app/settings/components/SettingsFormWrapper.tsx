// app/settings/SettingsForm.tsx

'use client'

import { useMutation } from '@blitzjs/rpc'
import { useState } from 'react'
import { SettingsForm } from 'src/app/settings/components/SettingsForm'
import updateSettingsMutation from 'src/app/settings/mutations/updateSettingsMutation'
import { UserSettings } from 'src/app/settings/queries/getSettings'

interface SettingsFormWrapperProps {
  initialSettings: UserSettings
  refetchSettings: () => void
}

export function SettingsFormWrapper({
  initialSettings,
  refetchSettings,
}: SettingsFormWrapperProps) {
  const [settings, setSettings] = useState(initialSettings)
  const [updateSettingsMutate] = useMutation(updateSettingsMutation)

  const handleSubmit = async (values) => {
    try {
      const updatedSettings = await updateSettingsMutate(values)
      setSettings((prev) => ({ ...prev, ...updatedSettings }))
      refetchSettings()
      alert('Updated successfully.')
    } catch (error: any) {
      console.error('Failed to update settings:', error)
      alert('Update failed.')
    }
  }

  return <SettingsForm initialValues={settings} onSubmit={handleSubmit} />
}

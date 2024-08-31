// app/settings/SettingsForm.tsx

'use client'

import { useMutation } from '@blitzjs/rpc'
import { useState } from 'react'
import { SettingsForm } from 'src/app/settings/components/SettingsForm'
import updateSettingsMutation from 'src/app/settings/mutations/updateSettingsMutation'
import { UserSettings } from 'src/app/settings/queries/getSettings'
import { FORM_ERROR } from 'src/core/components/Form'

export function SettingsFormWrapper({
  initialSettings,
}: {
  initialSettings: UserSettings
}) {
  const [settings, setSettings] = useState(initialSettings)
  const [updateSettingsMutate] = useMutation(updateSettingsMutation)

  const handleSubmit = async (values) => {
    try {
      const updatedSettings = await updateSettingsMutate(values)
      setSettings((prev) => ({ ...prev, ...updatedSettings }))
      alert('Updated successfully.')
    } catch (error: any) {
      console.error(error)
      alert('Update failed.')

      return {
        [FORM_ERROR]: error.toString(),
      }
    }
  }

  return <SettingsForm initialValues={settings} onSubmit={handleSubmit} />
}

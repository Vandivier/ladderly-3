import { useMutation, useQuery } from "@blitzjs/rpc"
import { FORM_ERROR } from "final-form"
import Head from "next/head"
import { Suspense } from "react"

import { SettingForm } from "src/settings/components/SettingForm"
import updateSettingsMutation from "src/settings/mutations/updateSettingsMutation"
import getSettings, { UserSettings } from "src/settings/queries/getSettings"
import { UpdateSettingsSchema } from "src/settings/schemas"
import { LadderlyPageWrapper } from "src/core/components/page-wrapper/LadderlyPageWrapper"

export const SettingsList = () => {
  const [settings, { setQueryData }] = useQuery(getSettings, {})
  const [updateSettings] = useMutation(updateSettingsMutation)

  return (
    <div className="my-4 w-full max-w-md rounded-lg bg-white p-8 shadow-md">
      <h1 className="mb-4 text-2xl font-bold text-gray-800">Edit Settings & Profile</h1>
      <p>Please email john@ladderly.io to update your subscription tier.</p>

      <Suspense>
        <SettingForm
          className="mt-4"
          submitText="Update Settings & Profile"
          schema={UpdateSettingsSchema}
          initialValues={settings}
          onSubmit={async (values) => {
            try {
              const updatedSettings = await updateSettings(values)
              const updatedUserSettings: UserSettings = {
                ...settings,
                ...updatedSettings,
              }

              await setQueryData(updatedUserSettings)
              alert("Updated successfully.")
            } catch (error: any) {
              console.error(error)
              return {
                [FORM_ERROR]: error.toString(),
              }
            }
          }}
        />
      </Suspense>
    </div>
  )
}

const SettingsPage = () => {
  return (
    <LadderlyPageWrapper>
      <Head>
        <title>Settings</title>
      </Head>

      <div className="flex items-center justify-center">
        <Suspense fallback={<div>Loading...</div>}>
          <SettingsList />
        </Suspense>
      </div>
    </LadderlyPageWrapper>
  )
}

export default SettingsPage

import { Routes } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { FORM_ERROR } from "final-form"
import Head from "next/head"
import Link from "next/link"
import { Suspense } from "react"

import Layout from "src/core/layouts/Layout"
import { SettingForm } from "src/settings/components/SettingForm"
import updateSettingsMutation from "src/settings/mutations/updateSettingsMutation"
import getSettings, { UserSettings } from "src/settings/queries/getSettings"
import { UpdateSettingsSchema } from "src/settings/schemas"

export const SettingsList = () => {
  const [settings, { setQueryData }] = useQuery(getSettings, {})
  const [updateSettings] = useMutation(updateSettingsMutation)

  return (
    <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
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
    <Layout>
      <Head>
        <title>Settings</title>
      </Head>

      <div className="relative min-h-screen">
        <nav className="border-ladderly-light-purple flex border bg-ladderly-off-white px-4 py-1 text-ladderly-violet-700">
          <Link href={Routes.Home()} className="ml-auto text-gray-800 hover:text-ladderly-pink">
            Back to Home
          </Link>
        </nav>
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <Suspense fallback={<div>Loading...</div>}>
            <SettingsList />
          </Suspense>
        </div>
      </div>
    </Layout>
  )
}

export default SettingsPage

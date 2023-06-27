import { Suspense } from "react"
import { FORM_ERROR } from "final-form"
import Head from "next/head"
import Layout from "src/core/layouts/Layout"
import { SettingForm } from "src/settings/components/SettingForm"
import getSettings from "src/settings/queries/getSettings"
import updateSettingMutation from "src/settings/mutations/updateSettingMutation"
import { useMutation, useQuery, invalidateQuery } from "@blitzjs/rpc"
// import { UpdateSettingSchema } from "../validations"
import Link from "next/link"
import { Routes } from "@blitzjs/next"

export const SettingsList = () => {
  const [setting] = useQuery(getSettings, {})
  const [updateSetting] = useMutation(updateSettingMutation)

  return (
    <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
      <h1 className="mb-4 text-2xl font-bold text-gray-800">Edit Setting {setting.id}</h1>
      <pre>{JSON.stringify(setting, null, 2)}</pre>
      <Suspense fallback={<div>Loading...</div>}>
        <SettingForm
          submitText="Update Setting"
          // schema={UpdateSettingSchema}
          initialValues={setting}
          onSubmit={async (values) => {
            try {
              const updated = await updateSetting({
                id: setting.id,
                ...values,
              })

              await invalidateQuery(getSettings)
              return updated
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
        <nav className="border-ladderly-light-purple flex border bg-ladderly-off-white px-4 py-1 text-ladderly-teal">
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

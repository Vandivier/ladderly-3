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
    <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-gray-800 font-bold text-2xl mb-4">Edit Setting {setting.id}</h1>
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
        <nav className="bg-ladderly-off-white border border-ladderly-light-purple text-ladderly-teal flex py-1 px-4">
          <Link href={Routes.Home()} className="ml-auto text-gray-800 hover:text-ladderly-pink">
            Back to Home
          </Link>
        </nav>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Suspense fallback={<div>Loading...</div>}>
            <SettingsList />
          </Suspense>
        </div>
      </div>
    </Layout>
  )
}

export default SettingsPage

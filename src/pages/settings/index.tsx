import { Suspense } from "react"
import { FORM_ERROR } from "final-form"
import Head from "next/head"
import Layout from "src/core/layouts/Layout"
import { SettingForm } from "src/settings/components/SettingForm"
import getSettings from "src/settings/queries/getSettings"
import updateSettingMutation from "src/settings/mutations/updateSettingMutation"
import { useMutation, useQuery, invalidateQuery } from "@blitzjs/rpc"
// import { UpdateSettingSchema } from "../validations"

export const SettingsList = () => {
  const [setting] = useQuery(getSettings, {})
  const [updateSetting] = useMutation(updateSettingMutation)

  return (
    <div>
      <h1>Edit Setting {setting.id}</h1>
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

      <div>
        <Suspense fallback={<div>Loading...</div>}>
          <SettingsList />
        </Suspense>
      </div>
    </Layout>
  )
}

export default SettingsPage

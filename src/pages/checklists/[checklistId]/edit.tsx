import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"

import Layout from "src/core/layouts/Layout"
import { UpdateChecklistSchema } from "src/app/checklists/schemas"
import getChecklist from "src/app/checklists/queries/getChecklist"
import updateChecklist from "src/app/checklists/mutations/updateChecklist"
import {
  ChecklistForm,
  FORM_ERROR,
} from "src/app/checklists/components/ChecklistForm"

export const EditChecklist = () => {
  const router = useRouter()
  const checklistId = useParam("checklistId", "number")
  const [checklist, { setQueryData }] = useQuery(
    getChecklist,
    { id: checklistId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )
  const [updateChecklistMutation] = useMutation(updateChecklist)

  return (
    <>
      <Head>
        <title>Edit Checklist {checklist.id}</title>
      </Head>

      <div>
        <h1>Edit Checklist {checklist.id}</h1>
        <pre>{JSON.stringify(checklist, null, 2)}</pre>
        <Suspense fallback={<div>Loading...</div>}>
          <ChecklistForm
            submitText="Update Checklist"
            schema={UpdateChecklistSchema}
            initialValues={checklist}
            onSubmit={async () => {
              try {
                const updated = await updateChecklistMutation({
                  id: checklist.id,
                })
                await setQueryData(updated)
                await router.push(
                  Routes.ShowChecklistPage({ checklistId: updated.id })
                )
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
    </>
  )
}

const EditChecklistPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <EditChecklist />
      </Suspense>

      <p>
        <Link href={Routes.ChecklistsPage()}>Checklists</Link>
      </p>
    </div>
  )
}

EditChecklistPage.authenticate = true
EditChecklistPage.getLayout = (page) => (
  <Layout title="Edit Checklist">{page}</Layout>
)

export default EditChecklistPage

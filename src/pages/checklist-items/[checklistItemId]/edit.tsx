import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"

import Layout from "src/core/layouts/Layout"
import { UpdateChecklistItemSchema } from "src/checklist-items/schemas"
import getChecklistItem from "src/checklist-items/queries/getChecklistItem"
import updateChecklistItem from "src/checklist-items/mutations/updateChecklistItem"
import { ChecklistItemForm, FORM_ERROR } from "src/checklist-items/components/ChecklistItemForm"

export const EditChecklistItem = () => {
  const router = useRouter()
  const checklistItemId = useParam("checklistItemId", "number")
  const [checklistItem, { setQueryData }] = useQuery(
    getChecklistItem,
    { id: checklistItemId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )
  const [updateChecklistItemMutation] = useMutation(updateChecklistItem)

  return (
    <>
      <Head>
        <title>Edit ChecklistItem {checklistItem.id}</title>
      </Head>

      <div>
        <h1>Edit ChecklistItem {checklistItem.id}</h1>
        <pre>{JSON.stringify(checklistItem, null, 2)}</pre>
        <Suspense fallback={<div>Loading...</div>}>
          <ChecklistItemForm
            submitText="Update ChecklistItem"
            schema={UpdateChecklistItemSchema}
            initialValues={checklistItem}
            onSubmit={async ({ isComplete }) => {
              try {
                const updated = await updateChecklistItemMutation({
                  id: checklistItem.id,
                  isComplete: isComplete,
                })
                await setQueryData(updated)
                await router.push(Routes.ShowChecklistItemPage({ checklistItemId: updated.id }))
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

const EditChecklistItemPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <EditChecklistItem />
      </Suspense>

      <p>
        <Link href={Routes.ChecklistItemsPage()}>ChecklistItems</Link>
      </p>
    </div>
  )
}

EditChecklistItemPage.authenticate = true
EditChecklistItemPage.getLayout = (page) => <Layout>{page}</Layout>

export default EditChecklistItemPage

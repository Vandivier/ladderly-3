import { Routes, useParam } from '@blitzjs/next'
import { useMutation, useQuery } from '@blitzjs/rpc'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Suspense } from 'react'

import { RoleEnum } from 'db'
import {
  ChecklistItemForm,
  FORM_ERROR,
} from 'src/app/checklist-items/components/ChecklistItemForm'
import updateChecklistItem from 'src/app/checklist-items/mutations/updateChecklistItem'
import getChecklistItem from 'src/app/checklist-items/queries/getChecklistItem'
import { UpdateChecklistItemSchema } from 'src/app/checklist-items/schemas'
import Layout from 'src/core/layouts/Layout'

export const EditChecklistItem = () => {
  const router = useRouter()
  const checklistItemId = useParam('checklistItemId', 'number')
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
            onSubmit={async ({}) => {
              try {
                const updated = await updateChecklistItemMutation({
                  id: checklistItem.id,
                })
                await setQueryData(updated)
                await router.push(
                  Routes.ShowChecklistItemPage({ checklistItemId: updated.id })
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

EditChecklistItemPage.authenticate = { role: RoleEnum.ADMIN }
EditChecklistItemPage.getLayout = (page) => (
  <Layout title="Edit Checklist">{page}</Layout>
)

export default EditChecklistItemPage

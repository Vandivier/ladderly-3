import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"

import Layout from "src/core/layouts/Layout"
import getChecklistItem from "src/checklist-items/queries/getChecklistItem"
import deleteChecklistItem from "src/checklist-items/mutations/deleteChecklistItem"

export const ChecklistItem = () => {
  const router = useRouter()
  const checklistItemId = useParam("checklistItemId", "number")
  const [deleteChecklistItemMutation] = useMutation(deleteChecklistItem)
  const [checklistItem] = useQuery(getChecklistItem, { id: checklistItemId })

  return (
    <>
      <Head>
        <title>ChecklistItem {checklistItem.id}</title>
      </Head>

      <div>
        <h1>ChecklistItem {checklistItem.id}</h1>
        <pre>{JSON.stringify(checklistItem, null, 2)}</pre>

        <Link
          href={Routes.EditChecklistItemPage({
            checklistItemId: checklistItem.id,
          })}
        >
          Edit
        </Link>

        <button
          type="button"
          onClick={async () => {
            if (window.confirm("This will be deleted")) {
              await deleteChecklistItemMutation({ id: checklistItem.id })
              await router.push(Routes.ChecklistItemsPage())
            }
          }}
          style={{ marginLeft: "0.5rem" }}
        >
          Delete
        </button>
      </div>
    </>
  )
}

const ShowChecklistItemPage = () => {
  return (
    <div>
      <p>
        <Link href={Routes.ChecklistItemsPage()}>ChecklistItems</Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <ChecklistItem />
      </Suspense>
    </div>
  )
}

ShowChecklistItemPage.authenticate = true
ShowChecklistItemPage.getLayout = (page) => <Layout>{page}</Layout>

export default ShowChecklistItemPage

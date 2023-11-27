import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"

import Layout from "src/core/layouts/Layout"
import getChecklist from "src/checklists/queries/getChecklist"
import deleteChecklist from "src/checklists/mutations/deleteChecklist"

export const Checklist = () => {
  const router = useRouter()
  const checklistId = useParam("checklistId", "number")
  const [deleteChecklistMutation] = useMutation(deleteChecklist)
  const [checklist] = useQuery(getChecklist, { id: checklistId })

  return (
    <>
      <Head>
        <title>Checklist {checklist.id}</title>
      </Head>

      <div>
        <h1>Checklist {checklist.id}</h1>
        <pre>{JSON.stringify(checklist, null, 2)}</pre>

        <Link href={Routes.EditChecklistPage({ checklistId: checklist.id })}>Edit</Link>

        <button
          type="button"
          onClick={async () => {
            if (window.confirm("This will be deleted")) {
              await deleteChecklistMutation({ id: checklist.id })
              await router.push(Routes.ChecklistsPage())
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

const ShowChecklistPage = () => {
  return (
    <div>
      <p>
        <Link href={Routes.ChecklistsPage()}>Checklists</Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <Checklist />
      </Suspense>
    </div>
  )
}

ShowChecklistPage.authenticate = true
ShowChecklistPage.getLayout = (page) => <Layout title="Checklist Details">{page}</Layout>

export default ShowChecklistPage

import { Routes } from "@blitzjs/next"
import Link from "next/link"
import { useRouter } from "next/router"
import { useMutation } from "@blitzjs/rpc"
import Layout from "src/core/layouts/Layout"
import { CreateChecklistItemSchema } from "src/checklist-items/schemas"
import createChecklistItem from "src/checklist-items/mutations/createChecklistItem"
import { ChecklistItemForm, FORM_ERROR } from "src/checklist-items/components/ChecklistItemForm"
import { Suspense } from "react"

const NewChecklistItemPage = () => {
  const router = useRouter()
  const [createChecklistItemMutation] = useMutation(createChecklistItem)

  return (
    <Layout title={"Create New ChecklistItem"}>
      <h1>Create New ChecklistItem</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <ChecklistItemForm
          submitText="Create ChecklistItem"
          schema={CreateChecklistItemSchema}
          // initialValues={{}}
          onSubmit={async (values) => {
            try {
              const checklistItem = await createChecklistItemMutation(values)
              await router.push(
                Routes.ShowChecklistItemPage({
                  checklistItemId: checklistItem.id,
                })
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
      <p>
        <Link href={Routes.ChecklistItemsPage()}>ChecklistItems</Link>
      </p>
    </Layout>
  )
}

NewChecklistItemPage.authenticate = true

export default NewChecklistItemPage

import { Routes } from '@blitzjs/next'
import { useMutation } from '@blitzjs/rpc'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Suspense } from 'react'
import {
  ChecklistForm,
  FORM_ERROR,
} from 'src/app/checklists/components/ChecklistForm'
import createChecklist from 'src/app/checklists/mutations/createChecklist'
import { CreateChecklistSchema } from 'src/app/checklists/schemas'
import Layout from 'src/core/layouts/Layout'

const NewChecklistPage = () => {
  const router = useRouter()
  const [createChecklistMutation] = useMutation(createChecklist)

  return (
    <Layout title={'Create New Checklist'}>
      <h1>Create New Checklist</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <ChecklistForm
          submitText="Create Checklist"
          schema={CreateChecklistSchema}
          // initialValues={{}}
          onSubmit={async (values) => {
            try {
              const checklist = await createChecklistMutation(values)
              await router.push(
                Routes.ShowChecklistPage({ checklistId: checklist.id })
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
        <Link href={Routes.ChecklistsPage()}>Checklists</Link>
      </p>
    </Layout>
  )
}

NewChecklistPage.authenticate = true

export default NewChecklistPage

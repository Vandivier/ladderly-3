// app/questions/ask/AskQuestionForm.tsx

'use client'

import { useMutation } from '@blitzjs/rpc'
import { useRouter } from 'next/navigation'
import React from 'react'
import createQuestion from 'src/app/questions/mutations/createQuestion'
import { useCurrentUser } from 'src/app/users/hooks/useCurrentUser'
import { Form, FORM_ERROR } from 'src/core/components/Form'
import LabeledTextField from 'src/core/components/LabeledTextField'
import { z } from 'zod'
import { PleaseLoginComponent } from './PleaseLoginComponent'

const QuestionSchema = z.object({
  name: z.string().min(10, 'Title must be at least 10 characters long'),
  body: z
    .string()
    .min(10, 'Question details must be at least 10 characters long'),
  tags: z.string().transform((val) => val.split(',').map((tag) => tag.trim())),
})

export function AskQuestionForm() {
  const router = useRouter()
  const [createQuestionMutation] = useMutation(createQuestion)
  const currentUser = useCurrentUser()
  if (!currentUser) {
    return <PleaseLoginComponent />
  }

  return (
    <Form
      schema={QuestionSchema}
      initialValues={{ name: '', body: '', tags: [] }}
      onSubmit={async (values: any) => {
        try {
          const parsed = QuestionSchema.parse(values)
          const question = await createQuestionMutation({
            ...parsed,
            type: 'QUESTION',
          })
          router.push(`/questions/${question.id}`)
        } catch (error) {
          console.error('Failed to create question:', error)
          return {
            [FORM_ERROR]:
              'Sorry, we had an unexpected error. Please try again.',
          }
        }
      }}
    >
      <section>
        <h3 className="mt-8 text-xl">Question Details</h3>
        <LabeledTextField
          name="name"
          label="Question Title"
          placeholder="e.g. How do I use useState in React?"
          outerProps={{ className: 'mt-2' }}
        />
        <LabeledTextField
          name="body"
          label="Question Details"
          placeholder="Provide details about your question..."
          outerProps={{ className: 'mt-2' }}
          // TODO: Add a textarea component
          // textarea
          // rows={6}
        />
        <LabeledTextField
          name="tags"
          label="Tags"
          placeholder="e.g. react, hooks, state-management (comma separated)"
          outerProps={{ className: 'mt-2' }}
        />
      </section>

      <button
        type="submit"
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Submit
      </button>
    </Form>
  )
}

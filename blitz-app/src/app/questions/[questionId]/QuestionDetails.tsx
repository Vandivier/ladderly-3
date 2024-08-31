// app/questions/[questionId]/QuestionDetails.tsx

'use client'

import { useMutation, useQuery } from '@blitzjs/rpc'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'
import createAnswer from 'src/app/questions/mutations/createAnswer'
import getQuestion from 'src/app/questions/queries/getQuestion'
import { Form, FORM_ERROR } from 'src/core/components/Form'
import LabeledTextField from 'src/core/components/LabeledTextField'
import { z } from 'zod'

const AnswerSchema = z.object({
  body: z.string().min(30, 'Answer must be at least 30 characters long'),
})

export default function QuestionDetails({
  questionId,
}: {
  questionId: number
}) {
  const [question] = useQuery(getQuestion, { id: questionId })
  const [createAnswerMutation] = useMutation(createAnswer)
  const router = useRouter()

  if (!question || !question.authorId) return <div>Question not found</div>
  const authorName = question.author?.nameFirst || 'Anonymous'

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">{question.name}</h1>
      <p className="mb-2 text-gray-600">
        Asked by{' '}
        <Link href={`/community/${question.authorId}`}>{authorName}</Link> on{' '}
        {new Date(question.createdAt).toLocaleDateString()}
      </p>
      <div className="mb-6">{question.body}</div>

      <div className="mb-4">
        {question.tags?.map((tag) => (
          <span
            key={tag}
            className="mr-2 inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700"
          >
            {tag}
          </span>
        ))}
      </div>

      <h2 className="mb-4 text-2xl font-bold">
        Answers ({question.answerCount})
      </h2>
      {question.answers?.map((answer) => (
        <div key={answer.id} className="mb-4 border-t pt-4">
          <p>{answer.body}</p>
          <p className="mt-2 text-sm text-gray-600">
            Answered by {answer.author?.name || 'Anonymous'} on{' '}
            {new Date(answer.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}

      <h3 className="mb-4 text-xl font-bold">Your Answer</h3>
      <Form
        schema={AnswerSchema}
        initialValues={{ body: '' }}
        onSubmit={async (values) => {
          try {
            await createAnswerMutation({
              body: values.body,
              questionId,
            })
            router.refresh()
          } catch (error) {
            console.error('Failed to submit answer:', error)
            return {
              [FORM_ERROR]:
                'Sorry, we had an unexpected error. Please try again.',
            }
          }
        }}
      >
        <LabeledTextField
          name="body"
          label="Answer"
          placeholder="Your answer here..."
          // TODO: Add a textarea component
          //   textarea
          //   rows={6}
        />
        <div className="mt-4">
          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
          >
            Submit Answer
          </button>
        </div>
      </Form>
    </div>
  )
}

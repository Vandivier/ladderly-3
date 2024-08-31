// app/questions/ClientQuestionsPage.tsx

'use client'

import { usePaginatedQuery } from '@blitzjs/rpc'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import React from 'react'
import getQuestions from 'src/app/questions/queries/getQuestions'

const ITEMS_PER_PAGE = 20

export default function ClientQuestionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = Number(searchParams?.get('page') ?? '0')
  const [{ questions, hasMore }, { refetch, isFetching }] = usePaginatedQuery(
    getQuestions,
    {
      orderBy: { createdAt: 'desc' },
      skip: ITEMS_PER_PAGE * page,
      take: ITEMS_PER_PAGE,
    }
  )

  const goToPreviousPage = () => router.push(`/questions?page=${page - 1}`)
  const goToNextPage = () => router.push(`/questions?page=${page + 1}`)

  if (isFetching) return <div>Loading...</div>
  if (!questions || questions.length === 0)
    return <div>No questions found.</div>

  return (
    <div>
      <ul className="space-y-4">
        {questions.map((question) => (
          <li key={question.id} className="border-b pb-4">
            <Link href={`/questions/${question.id}`}>
              <h3 className="text-xl font-semibold text-blue-600 hover:text-blue-800">
                {question.name}
              </h3>
            </Link>
            <p className="text-sm text-gray-600">
              Asked by {question.author?.name || 'Anonymous'} on{' '}
              {new Date(question.createdAt).toLocaleDateString()}
            </p>
            <p className="mt-2 text-gray-700">
              {question.body?.substring(0, 150)}...
            </p>
            <div className="mt-2 flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {question.voteCount || 0} votes
              </span>
              <span className="text-sm text-gray-500">
                {question.answerCount || 0} answers
              </span>
              {question.tags?.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex justify-between">
        <button
          onClick={goToPreviousPage}
          disabled={page === 0}
          className="rounded bg-blue-500 px-4 py-2 text-white disabled:bg-gray-300"
        >
          Previous
        </button>
        <button
          onClick={goToNextPage}
          disabled={!hasMore}
          className="rounded bg-blue-500 px-4 py-2 text-white disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  )
}

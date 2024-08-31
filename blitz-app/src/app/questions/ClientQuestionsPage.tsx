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
  const [{ questions, hasMore }] = usePaginatedQuery(getQuestions, {
    orderBy: { createdAt: 'desc' },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => {
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    params.set('page', String(page - 1))
    router.push(`?${params.toString()}`)
  }
  const goToNextPage = () => {
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    params.set('page', String(page + 1))
    router.push(`?${params.toString()}`)
  }

  return (
    <div>
      <ul className="my-4 space-y-4">
        {questions.map((question) => (
          <li key={question.id} className="border-b pb-4">
            <Link href={`/questions/${question.id}`} className="block">
              <h3 className="text-xl font-semibold text-blue-600 hover:text-blue-800">
                {question.title}
              </h3>
              <p className="text-sm text-gray-600">
                Asked by {question.author.name || `User ${question.author.id}`}{' '}
                on {new Date(question.createdAt).toLocaleDateString()}
              </p>
              <p className="mt-2 text-gray-700">
                {question.description.substring(0, 150)}...
              </p>
            </Link>
            <div className="mt-2 flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {question.voteCount} votes
              </span>
              <span className="text-sm text-gray-500">
                {question.answerCount} answers
              </span>
              {question.tags.map((tag) => (
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
          disabled={page === 0}
          onClick={goToPreviousPage}
          className="rounded bg-blue-500 px-4 py-2 text-white disabled:bg-gray-300"
        >
          Previous
        </button>
        <button
          disabled={!hasMore}
          onClick={goToNextPage}
          className="rounded bg-blue-500 px-4 py-2 text-white disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  )
}

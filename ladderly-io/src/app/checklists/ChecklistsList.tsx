'use client'

import React from 'react'
import { api } from '~/trpc/react'
import Link from 'next/link'

const ITEMS_PER_PAGE = 100

export function ChecklistsList() {
  const [page, setPage] = React.useState(0)
  const { data, isLoading } = api.checklist.list.useQuery({
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  if (isLoading) return null // The skeleton is handled by the parent
  if (!data) return <div>No checklists found</div>

  const { checklists, hasMore } = data

  const goToPreviousPage = () => setPage((p) => Math.max(0, p - 1))
  const goToNextPage = () => setPage((p) => (hasMore ? p + 1 : p))

  return (
    <div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {checklists.map((checklist) => {
          const checklistSubRoute = checklist.prettyRoute ?? checklist.id

          return (
            <Link
              key={checklist.id}
              href={`/checklists/${checklistSubRoute}`}
              className="group flex flex-col justify-between rounded-lg bg-white p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-ladderly-violet-600">
                  {checklist.name}
                </h3>
              </div>
              <div className="mt-4">
                <span className="text-sm font-medium text-ladderly-violet-600 group-hover:underline">
                  View Checklist →
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      {hasMore && (
        <div className="mt-12 flex justify-center gap-4">
          <button
            disabled={page === 0}
            onClick={goToPreviousPage}
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            disabled={!hasMore}
            onClick={goToNextPage}
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

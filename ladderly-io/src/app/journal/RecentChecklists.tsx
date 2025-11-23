'use client'

import Link from 'next/link'
import { useState } from 'react'
import { api } from '~/trpc/react'

export const RecentChecklists = () => {
  const [isExpanded, setIsExpanded] = useState(false)

  const { data: recentChecklists, isLoading } =
    api.checklist.getRecentChecklists.useQuery(undefined, {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 5 * 60 * 1000,
    })

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">
          Loading recent checklists...
        </p>
      </div>
    )
  }

  if (!recentChecklists || recentChecklists.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold dark:text-gray-100">
            My Recent Checklists
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {isExpanded ? 'Hide' : 'Show'}
          </button>
        </div>
        {isExpanded && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No checklists yet.{' '}
            <Link
              href="/checklists"
              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Browse checklists
            </Link>
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold dark:text-gray-100">
          My Recent Checklists
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {isExpanded ? 'Hide' : 'Show'}
        </button>
      </div>

      {isExpanded && (
        <>
          <ul className="space-y-2">
            {recentChecklists.map((checklist) => (
              <li key={checklist.id}>
                <Link
                  href={`/checklists/${checklist.prettyRoute ?? checklist.id}`}
                  className="block rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{checklist.name}</span>
                    <svg
                      className="size-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {recentChecklists.length < 3 && (
            <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
              <Link
                href="/checklists"
                className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Browse all checklists →
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default RecentChecklists

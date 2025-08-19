'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

type CompletionStatus = 'all' | 'solved' | 'unsolved'

export const CompletionStatusFilter = () => {
  const router = useRouter()
  const searchParams = useSearchParams() ?? new URLSearchParams()

  // Get current status from URL or default to 'all'
  const currentStatus =
    (searchParams.get('status') as CompletionStatus) || 'all'

  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const status = e.target.value as CompletionStatus
      const params = new URLSearchParams(searchParams.toString())

      // Update or remove status parameter
      if (status === 'all') {
        params.delete('status')
      } else {
        params.set('status', status)
      }

      // Use the correct way to update URL with params in Next.js
      router.push(`?${params.toString()}`)
    },
    [router, searchParams],
  )

  return (
    <div>
      <label
        htmlFor="status-filter"
        className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Completion Status
      </label>
      <select
        id="status-filter"
        value={currentStatus}
        onChange={handleStatusChange}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        <option value="all">All Problems</option>
        <option value="solved">Solved Problems</option>
        <option value="unsolved">Unsolved Problems</option>
      </select>
    </div>
  )
}

export default CompletionStatusFilter

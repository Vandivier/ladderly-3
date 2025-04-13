'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface LeetCodeProblem {
  href: string
  name: string
  source: string
}

export function LeetCodeList() {
  const [problems, setProblems] = useState<LeetCodeProblem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const sourceFilter = searchParams.get('source') || 'all'

  useEffect(() => {
    async function fetchProblems() {
      try {
        setIsLoading(true)
        // In a real implementation, this would fetch from an API endpoint
        const response = await fetch('/api/leetcode-problems')
        if (!response.ok) {
          throw new Error('Failed to fetch problems')
        }
        const data = await response.json()

        // Filter by source if needed
        const filtered =
          sourceFilter === 'all'
            ? data
            : data.filter(
                (problem: LeetCodeProblem) =>
                  problem.source === sourceFilter ||
                  problem.source === 'multiple',
              )

        setProblems(filtered)
      } catch (error) {
        console.error('Error fetching problems:', error)
        // Fallback to empty array on error
        setProblems([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProblems()
  }, [sourceFilter])

  if (isLoading) {
    return <div className="py-4 text-center">Loading problems...</div>
  }

  if (problems.length === 0) {
    return (
      <div className="py-4 text-center">
        No problems found. Try adjusting your filters.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Showing {problems.length} problems{' '}
        {sourceFilter !== 'all' ? `from ${sourceFilter}` : ''}
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Problem
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Source
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Link
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {problems.map((problem, index) => (
              <tr key={`${problem.name}-${index}`}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {problem.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {problem.source}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-blue-500">
                  <a
                    href={problem.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Solve
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

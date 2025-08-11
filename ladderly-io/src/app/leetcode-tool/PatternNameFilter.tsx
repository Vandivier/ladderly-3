'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useCallback } from 'react'

// Common patterns seen across sources; UI-friendly labels
const patterns = [
  'All Patterns',
  'Array',
  'Two Pointers',
  'Monotonic Stack',
  'Binary Search',
  'Backtracking',
  'Matrix',
  'String',
  'DFS',
  'BFS',
  'Trie',
  'Linked List',
  'Fast and Slow Pointers',
  'Recursion',
  'Tree Algorithms',
  'Prefix Sum',
  'Greedy',
  'Heap / Priority Queue',
  'Memoization',
  'Dynamic Programming',
  'Graphs',
]

export function PatternNameFilter() {
  const router = useRouter()
  const params = useSearchParams() ?? new URLSearchParams()
  const current = params.get('pattern') ?? 'All Patterns'

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const next = new URLSearchParams(params)
      const value = e.target.value
      if (value === 'All Patterns') {
        next.delete('pattern')
      } else {
        next.set('pattern', value)
      }
      router.push(`?${next.toString()}`)
    },
    [params, router],
  )

  return (
    <div className="flex w-full flex-col space-y-2 md:w-64">
      <label
        htmlFor="pattern-filter"
        className="text-sm font-medium text-gray-700"
      >
        Filter by Pattern
      </label>
      <select
        id="pattern-filter"
        value={current}
        onChange={onChange}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        aria-label="Filter by pattern"
      >
        {patterns.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
    </div>
  )
}

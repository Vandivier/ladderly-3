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
    <select
      value={current}
      onChange={onChange}
      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 md:w-64"
      aria-label="Filter by pattern"
    >
      {patterns.map((p) => (
        <option key={p} value={p}>
          {p}
        </option>
      ))}
    </select>
  )
}

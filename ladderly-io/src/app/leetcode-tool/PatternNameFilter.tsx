'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { type MultiValue } from 'react-select'
import Select from 'react-select'

// Common patterns seen across sources; UI-friendly labels
const patterns = [
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

type OptionType = { value: string; label: string }
const options: OptionType[] = patterns.map((p) => ({ value: p, label: p }))

export function PatternNameFilter() {
  const router = useRouter()
  const params = useSearchParams() ?? new URLSearchParams()
  const currentPatterns = params.getAll('pattern')
  const value = options.filter((o) => currentPatterns.includes(o.value))

  const onChange = useCallback(
    (selectedOptions: MultiValue<OptionType>) => {
      const next = new URLSearchParams(params)
      next.delete('pattern')
      selectedOptions.forEach((option) => {
        next.append('pattern', option.value)
      })
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
      <Select
        id="pattern-filter"
        isMulti
        options={options}
        value={value}
        onChange={onChange}
        className="block w-full rounded-md shadow-sm sm:text-sm"
        aria-label="Filter by pattern"
      />
    </div>
  )
}

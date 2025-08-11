'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useCallback } from 'react'

const difficulties = ['All Difficulties', 'Easy', 'Medium', 'Hard']

export function DifficultyFilter() {
  const router = useRouter()
  const params = useSearchParams() ?? new URLSearchParams()
  const current = params.get('difficulty') ?? 'All Difficulties'

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const next = new URLSearchParams(params)
      const value = e.target.value
      if (value === 'All Difficulties') {
        next.delete('difficulty')
      } else {
        next.set('difficulty', value)
      }
      router.push(`?${next.toString()}`)
    },
    [params, router],
  )

  return (
    <div className="flex w-full flex-col space-y-2 md:w-64">
      <label
        htmlFor="difficulty-filter"
        className="text-sm font-medium text-gray-700"
      >
        Filter by Difficulty
      </label>
      <select
        id="difficulty-filter"
        value={current}
        onChange={onChange}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        aria-label="Filter by difficulty"
      >
        {difficulties.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
    </div>
  )
}

export default DifficultyFilter

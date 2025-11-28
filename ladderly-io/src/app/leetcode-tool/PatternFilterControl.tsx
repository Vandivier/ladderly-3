'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useCallback, useMemo } from 'react'

const patterns = [
  'all',
  'ladderly-expanded-kata',
  'sean-prashad-leetcode-patterns',
  'grind-75',
  'neetcode-250',
]

export function PatternFilterControl() {
  const router = useRouter()
  const searchParamsHook = useSearchParams()
  const searchParams = useMemo(() => {
    return new URLSearchParams(searchParamsHook?.toString() ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParamsHook?.toString()])
  const currentPattern = searchParams.get('source') ?? 'all'

  const handleFilterChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newParams = new URLSearchParams(searchParams)
      newParams.set('source', event.target.value)
      router.push(`?${newParams.toString()}`)
    },
    [router, searchParams],
  )

  return (
    <select
      onChange={handleFilterChange}
      value={currentPattern}
      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200/50 md:w-64"
    >
      {patterns.map((pattern) => (
        <option key={pattern} value={pattern}>
          {pattern.charAt(0).toUpperCase() +
            pattern.slice(1).replace(/-/g, ' ')}
        </option>
      ))}
    </select>
  )
}

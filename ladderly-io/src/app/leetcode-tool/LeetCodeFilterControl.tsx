'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export function LeetCodeFilterControl() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sourceFilter, setSourceFilter] = useState(
    searchParams.get('source') || 'all',
  )

  // List of available sources based on tags in the checklist
  const sources = [
    { value: 'all', label: 'All Sources' },
    { value: 'ladderly-expanded-kata', label: 'Ladderly Expanded Kata' },
    { value: 'grind-75', label: 'Grind 75' },
    { value: 'neetcode-250', label: 'Neetcode 250' },
    { value: 'sean-prashad-patterns', label: 'Sean Prashad Patterns' },
    { value: 'multiple', label: 'Featured in Multiple Lists' },
  ]

  const handleSourceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    setSourceFilter(value)

    // Update URL with the new filter
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('source')
    } else {
      params.set('source', value)
    }

    // Push the new URL
    router.push(`/leetcode-tool?${params.toString()}`)
  }

  return (
    <div className="flex flex-col items-start space-y-4 md:flex-row md:space-x-4 md:space-y-0">
      <div className="flex w-full flex-col space-y-2 md:w-64">
        <label
          htmlFor="source-filter"
          className="text-sm font-medium text-gray-700"
        >
          Filter by Source
        </label>
        <select
          id="source-filter"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          value={sourceFilter}
          onChange={handleSourceChange}
        >
          {sources.map((source) => (
            <option key={source.value} value={source.value}>
              {source.label}
            </option>
          ))}
        </select>
      </div>

      {sourceFilter !== 'all' && (
        <button
          className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          onClick={() => {
            setSourceFilter('all')
            const params = new URLSearchParams(searchParams.toString())
            params.delete('source')
            router.push(`/leetcode-tool?${params.toString()}`)
          }}
        >
          Clear Filter
        </button>
      )}
    </div>
  )
}

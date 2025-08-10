'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'

export function SearchControl() {
  const router = useRouter()
  const searchParams = useSearchParams() ?? new URLSearchParams()
  const initial = useMemo(
    () => searchParams.get('search') ?? '',
    [searchParams],
  )
  const [value, setValue] = useState(initial)

  const applySearch = useCallback(() => {
    const next = new URLSearchParams(searchParams)
    if (value && value.trim().length > 0) {
      next.set('search', value.trim())
    } else {
      next.delete('search')
    }
    router.push(`?${next.toString()}`)
  }, [router, searchParams, value])

  return (
    <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
      <input
        type="text"
        placeholder="Search by problem name..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 md:w-64"
      />
      <button
        type="button"
        onClick={applySearch}
        className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        Apply Search
      </button>
    </div>
  )
}

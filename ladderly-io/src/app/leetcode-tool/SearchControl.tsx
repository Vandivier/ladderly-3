'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useCallback } from 'react'

export function SearchControl() {
  const router = useRouter()
  const searchParams = useSearchParams() ?? new URLSearchParams()

  const handleSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newParams = new URLSearchParams(searchParams)
      newParams.set('search', event.target.value)
      router.push(`?${newParams.toString()}`)
    },
    [router, searchParams],
  )

  return (
    <input
      type="text"
      placeholder="Search by problem name..."
      onChange={handleSearch}
      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 md:w-64"
      defaultValue={searchParams.get('search') ?? ''}
    />
  )
}

// src/app/community/ClientCommunityPage.tsx

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import { api } from '~/trpc/react'
import {
  CommunityMemberListItem,
  type PublicUser,
} from './CommunityMemberListItem'

const ITEMS_PER_PAGE = 10

interface FilterChipProps {
  active: boolean
  onClick: () => void
  className: string
  children: React.ReactNode
}

const FilterChip: React.FC<FilterChipProps> = ({
  active,
  onClick,
  className,
  children,
}) => (
  <button
    onClick={onClick}
    className={`${className} cursor-pointer transition-colors hover:opacity-80 ${
      active ? 'ring-2 ring-offset-2' : ''
    }`}
  >
    {children}
  </button>
)

export default function ClientCommunityPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = Number(searchParams?.get('page') ?? '0')
  const searchTerm = searchParams?.get('q') ?? ''
  const openToWork = searchParams?.get('openToWork') === 'true'
  const hasContact = searchParams?.get('hasContact') === 'true'
  const hasNetworking = searchParams?.get('hasNetworking') === 'true'
  const hasServices = searchParams?.get('hasServices') === 'true'

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    // Reset to first page when filters change
    params.set('page', '0')

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    router.push(`?${params.toString()}`)
  }

  const toggleOpenToWork = () => {
    updateFilters({ openToWork: openToWork ? null : 'true' })
  }

  const toggleHasContact = () => {
    updateFilters({ hasContact: hasContact ? null : 'true' })
  }

  const toggleHasNetworking = () => {
    updateFilters({ hasNetworking: hasNetworking ? null : 'true' })
  }

  const toggleHasServices = () => {
    updateFilters({ hasServices: hasServices ? null : 'true' })
  }

  const { data, isLoading } = api.user.getPaginatedUsers.useQuery({
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
    searchTerm,
    openToWork,
    hasContact,
    hasNetworking,
    hasServices,
  })

  const goToPreviousPage = () => {
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    params.set('page', String(page - 1))
    router.push(`?${params.toString()}`)
  }

  const goToNextPage = () => {
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    params.set('page', String(page + 1))
    router.push(`?${params.toString()}`)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  const { users, hasMore } = data ?? { users: [], hasMore: false }
  const hasPreviousPage = page > 0

  return (
    <div>
      {/* Active Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <FilterChip
          active={openToWork}
          onClick={toggleOpenToWork}
          className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800"
        >
          Open to Work
        </FilterChip>
        <FilterChip
          active={hasContact}
          onClick={toggleHasContact}
          className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800"
        >
          Has Contact Info
        </FilterChip>
        <FilterChip
          active={hasNetworking}
          onClick={toggleHasNetworking}
          className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800"
        >
          Has Networking Interests
        </FilterChip>
        <FilterChip
          active={hasServices}
          onClick={toggleHasServices}
          className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
        >
          Offers Services
        </FilterChip>
      </div>

      {users.length > 0 ? (
        <ul className="my-4 space-y-4">
          {users.map((user: PublicUser) => (
            <CommunityMemberListItem key={user.id} user={user} />
          ))}
        </ul>
      ) : (
        <p className="p-2">No Results Found.</p>
      )}

      <div className="mt-6 flex gap-4">
        {hasPreviousPage && (
          <button
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
            disabled={!hasPreviousPage}
            onClick={goToPreviousPage}
          >
            Previous
          </button>
        )}
        {hasMore && (
          <button
            disabled={!hasMore}
            onClick={goToNextPage}
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            Next
          </button>
        )}
      </div>
    </div>
  )
}

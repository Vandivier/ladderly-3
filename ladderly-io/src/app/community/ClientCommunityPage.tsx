// src/app/community/ClientCommunityPage.tsx

'use client'

import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import React from 'react'
import { api } from '~/trpc/react'

const ITEMS_PER_PAGE = 10

interface User {
  id: number
  uuid: string
  createdAt: Date
  nameFirst: string | null
  nameLast: string | null
  hasPublicProfileEnabled: boolean
  hasShoutOutsEnabled: boolean
  hasOpenToWork: boolean
  profileBlurb: string | null
  profileContactEmail: string | null
  profileGitHubUri: string | null
  profileHomepageUri: string | null
  profileLinkedInUri: string | null
  profileTopSkills: string[]
  profileYearsOfExperience: number | null
  profileHighestDegree: string | null
  profileCurrentJobTitle: string | null
}

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

  const { data, isLoading } = api.user.getPaginatedUsers.useQuery({
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
    searchTerm,
    openToWork,
    hasContact,
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
      </div>

      <ul className="my-4 space-y-4">
        {users.map((user: User) => (
          <li key={user.id} className="rounded-lg border border-gray-200 p-4">
            <div className="flex flex-col gap-2">
              {/* Name and Job Title */}
              <div>
                <Link
                  href={`/community/${user.id}`}
                  className="text-lg font-semibold hover:text-blue-600"
                >
                  {user.nameFirst ? user.nameFirst : `User ${user.id}`}
                  {user.nameLast ? ` ${user.nameLast}` : ''}
                </Link>
                {user.profileCurrentJobTitle && (
                  <span className="ml-2 text-gray-600">
                    • {user.profileCurrentJobTitle}
                  </span>
                )}
              </div>

              {/* Status Chips */}
              <div className="flex flex-wrap gap-2">
                {user.hasOpenToWork && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                    Open to Work
                  </span>
                )}
                {user.profileYearsOfExperience && (
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                    YOE: {user.profileYearsOfExperience}
                  </span>
                )}
                {user.profileHighestDegree && (
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                    {user.profileHighestDegree}
                  </span>
                )}
                {(user.profileContactEmail || user.profileLinkedInUri) && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
                    {user.profileContactEmail && user.profileLinkedInUri
                      ? 'Email + LinkedIn'
                      : user.profileContactEmail
                        ? 'Email'
                        : 'LinkedIn'}
                  </span>
                )}
              </div>

              {/* Skills */}
              {user.profileTopSkills?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {user.profileTopSkills
                    .slice(0, 3)
                    .sort()
                    .map((skill, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-800"
                      >
                        {skill}
                      </span>
                    ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

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

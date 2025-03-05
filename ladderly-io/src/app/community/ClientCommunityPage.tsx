// src/app/community/ClientCommunityPage.tsx

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { api } from '~/trpc/react'
import { CommunityMemberListItem } from './CommunityMemberListItem'

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
  const page = parseInt(searchParams.get('page') || '0')
  const searchTerm = searchParams.get('q') || ''
  const openToWork = searchParams.get('openToWork') === 'true'
  const hasContact = searchParams.get('hasContact') === 'true'
  const hasNetworking = searchParams.get('hasNetworking') === 'true'
  const hasServices = searchParams.get('hasServices') === 'true'

  // New state for skill filters
  const [skillFilters, setSkillFilters] = useState<string[]>([])
  const [topSkills, setTopSkills] = useState<string[]>([])

  const { data, isLoading } = api.user.getPaginatedUsers.useQuery({
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
    searchTerm,
    openToWork,
    hasContact,
    hasNetworking,
    hasServices,
  })

  // Extract top skills from all users
  useEffect(() => {
    if (data?.users) {
      // Collect all skills from all users
      const allSkills = data.users.flatMap(
        (user) => user.profileTopSkills || [],
      )

      // Count occurrences of each skill
      const skillCounts = allSkills.reduce(
        (acc, skill) => {
          acc[skill] = (acc[skill] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      // Sort by frequency and take top 3
      const sortedSkills = Object.entries(skillCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([skill]) => skill)
        .slice(0, 3)

      setTopSkills(sortedSkills)
    }
  }, [data])

  const users = data?.users || []
  const hasMore = data?.hasMore || false
  const hasPreviousPage = page > 0

  const updateSearchParams = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        newParams.delete(key)
      } else {
        newParams.set(key, value)
      }
    })
    router.push(`/community?${newParams.toString()}`)
  }

  const toggleOpenToWork = () => {
    updateSearchParams({ openToWork: openToWork ? null : 'true', page: '0' })
  }

  const toggleHasContact = () => {
    updateSearchParams({ hasContact: hasContact ? null : 'true', page: '0' })
  }

  const toggleHasNetworking = () => {
    updateSearchParams({
      hasNetworking: hasNetworking ? null : 'true',
      page: '0',
    })
  }

  const toggleHasServices = () => {
    updateSearchParams({ hasServices: hasServices ? null : 'true', page: '0' })
  }

  // New function to toggle skill filter
  const toggleSkillFilter = (skill: string) => {
    const isActive = skillFilters.includes(skill)

    if (isActive) {
      setSkillFilters(skillFilters.filter((s) => s !== skill))
      // Remove from search term if it's there
      if (searchTerm.includes(skill)) {
        updateSearchParams({
          q: searchTerm.replace(skill, '').trim(),
          page: '0',
        })
      }
    } else {
      setSkillFilters([...skillFilters, skill])
      // Add to search term
      const newSearchTerm = searchTerm ? `${searchTerm} ${skill}` : skill
      updateSearchParams({ q: newSearchTerm, page: '0' })
    }
  }

  const goToNextPage = () => {
    updateSearchParams({ page: (page + 1).toString() })
  }

  const goToPreviousPage = () => {
    updateSearchParams({ page: (page - 1).toString() })
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    updateSearchParams({ q: value || null, page: '0' })
  }

  if (isLoading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="p-4">
      <h1 className="mb-6 text-2xl font-bold">Community Members</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, job title, or skills..."
          className="w-full rounded-md border border-gray-300 p-2"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="mb-2 font-medium">Filters:</div>
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

      {topSkills.length > 0 && (
        <>
          <div className="mb-2 font-medium">Top Skills:</div>
          <div className="mb-4 flex flex-wrap gap-2">
            {topSkills.map((skill) => (
              <FilterChip
                key={skill}
                active={skillFilters.includes(skill)}
                onClick={() => toggleSkillFilter(skill)}
                className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800"
              >
                {skill}
              </FilterChip>
            ))}
          </div>
        </>
      )}

      {users.length > 0 ? (
        <ul className="my-4 space-y-4">
          {users.map((user) => (
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

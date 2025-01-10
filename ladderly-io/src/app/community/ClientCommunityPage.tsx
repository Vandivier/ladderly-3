// src/app/community/ClientCommunityPage.tsx

'use client'

import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import React from 'react'
import { api } from '~/trpc/react'

const ITEMS_PER_PAGE = 20

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
  totalContributions: number
}

export default function ClientCommunityPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = Number(searchParams?.get('page') ?? '0')
  const searchTerm = searchParams?.get('q') ?? ''

  const { data, isLoading } = api.user.getPaginatedUsers.useQuery({
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
    searchTerm,
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
      <ul className="my-4">
        {users.map((user: User) => (
          <li key={user.id}>
            <Link href={`/community/${user.id}`}>
              {user.nameFirst ? user.nameFirst : `User ${user.id}`}
            </Link>
            {user.hasOpenToWork && (
              <span className="mx-3 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                Open to Work
              </span>
            )}
          </li>
        ))}
      </ul>

      {hasPreviousPage ? (
        <button
          className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          disabled={!hasPreviousPage}
          onClick={goToPreviousPage}
        >
          Previous
        </button>
      ) : null}
      {hasMore ? (
        <button
          disabled={!hasMore}
          onClick={goToNextPage}
          className={`mt-4 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 ${
            hasPreviousPage ? 'ml-4' : ''
          }`}
        >
          Next
        </button>
      ) : null}
    </div>
  )
}

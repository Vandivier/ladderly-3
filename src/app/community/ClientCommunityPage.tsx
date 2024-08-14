// app/community/ClientCommunityPage.tsx

'use client'

import { Routes } from '@blitzjs/next'
import { usePaginatedQuery } from '@blitzjs/rpc'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import React from 'react'
import getUsers from 'src/app/users/queries/getUsers'

const ITEMS_PER_PAGE = 100

export default function ClientCommunityPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = Number(searchParams?.get('page') ?? '0')
  const [{ users, hasMore }] = usePaginatedQuery(getUsers, {
    orderBy: { createdAt: 'desc' },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
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

  return (
    <div>
      <ul className="my-4">
        {users.map((user) => (
          <li key={user.id}>
            <Link href={`/community/${user.id}`}>
              {user.nameFirst || `User ${user.id}`}
            </Link>
            {user.hasOpenToWork && (
              <span className="mx-3 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                Open to Work
              </span>
            )}
          </li>
        ))}
      </ul>

      <button disabled={page === 0} onClick={goToPreviousPage}>
        Previous
      </button>
      <button disabled={!hasMore} onClick={goToNextPage} className="pl-4">
        Next
      </button>
    </div>
  )
}

'use client'

import { usePaginatedQuery } from '@blitzjs/rpc'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import React, { Suspense } from 'react'
import getUsers from 'src/app/users/queries/getUsers'
import { LargeCard } from 'src/core/components/LargeCard'
import { LadderlyPageWrapper } from 'src/core/components/page-wrapper/LadderlyPageWrapper'

const ITEMS_PER_PAGE = 100

const UsersList = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = Number(searchParams?.get('page') ?? '0')
  const [{ users, hasMore }] = usePaginatedQuery(getUsers, {
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
  const displayName = (user) =>
    user.nameFirst ? `${user.nameFirst} ${user.nameLast}` : `User ${user.id}`

  return (
    <div>
      {/* TODO: LabeledDropDown that picks whether to count store purchases */}
      <ul className="my-4">
        {users.map((user) => (
          <li key={user.id}>
            <Link href={`/community/${user.id}`}>{displayName(user)}</Link>

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

const HallOfFamePage = () => {
  return (
    <LadderlyPageWrapper title="Hall of Fame">
      <LargeCard>
        <h1 className="text-2xl font-bold text-gray-800">
          Top Contributing Members
        </h1>
        <Suspense fallback="Loading...">
          <UsersList />
        </Suspense>
      </LargeCard>
    </LadderlyPageWrapper>
  )
}

export default HallOfFamePage

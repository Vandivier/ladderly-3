import { BlitzPage, Routes } from '@blitzjs/next'
import { usePaginatedQuery } from '@blitzjs/rpc'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { Suspense } from 'react'
import getUsers from 'src/app/users/queries/getUsers'
import { LargeCard } from 'src/core/components/LargeCard'
import { LadderlyPageWrapper } from 'src/core/components/page-wrapper/LadderlyPageWrapper'

const ITEMS_PER_PAGE = 100

export const UsersList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ users, hasMore }] = usePaginatedQuery(getUsers, {
    orderBy: { createdAt: 'desc' },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <div>
      <ul className="my-4">
        {users.map((user) => (
          <li key={user.id}>
            <Link href={Routes.ShowUserPage({ userId: user.id })}>
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

const CommunityPage: BlitzPage = () => {
  return (
    <LadderlyPageWrapper title="Community">
      <LargeCard>
        <h1 className="text-2xl font-bold text-gray-800">Member Profiles</h1>
        <h3>Sorted by Signup Date</h3>
        <Suspense fallback="Loading...">
          <UsersList />
        </Suspense>
      </LargeCard>
    </LadderlyPageWrapper>
  )
}

export default CommunityPage

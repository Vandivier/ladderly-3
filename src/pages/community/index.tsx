import { BlitzPage, Routes } from "@blitzjs/next"
import { usePaginatedQuery } from "@blitzjs/rpc"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { Suspense } from "react"
import { LadderlyPageWrapper } from "src/core/components/page-wrapper/LadderlyPageWrapper"
import getUsers from "src/users/queries/getUsers"

const ITEMS_PER_PAGE = 100

export const UsersList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ users, hasMore }] = usePaginatedQuery(getUsers, {
    orderBy: { createdAt: "desc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <div>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <Link href={Routes.ShowUserPage({ userId: user.id })}>
              {user.nameFirst || `User ${user.id}`}
            </Link>
            {user.hasOpenToWork && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
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
    <LadderlyPageWrapper title="Ladderly | Community">
      <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center">
        <div className="m-8 w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-xl">
          <h1 className="mb-4 text-2xl font-bold text-gray-800">Users</h1>
          <Suspense fallback="Loading...">
            <UsersList />
          </Suspense>
        </div>
      </div>
    </LadderlyPageWrapper>
  )
}

export default CommunityPage

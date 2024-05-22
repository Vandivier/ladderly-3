import { Suspense } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { usePaginatedQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import Layout from "src/core/layouts/Layout"
import getChecklists from "src/app/checklists/queries/getChecklists"

const ITEMS_PER_PAGE = 100

export const ChecklistsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ checklists, hasMore }] = usePaginatedQuery(getChecklists, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <div>
      <ul>
        {checklists.map((checklist) => (
          <li key={checklist.id}>
            <Link
              href={Routes.ShowChecklistPage({ checklistId: checklist.id })}
            >
              {checklist.name}
            </Link>
          </li>
        ))}
      </ul>

      <button disabled={page === 0} onClick={goToPreviousPage}>
        Previous
      </button>
      <button disabled={!hasMore} onClick={goToNextPage}>
        Next
      </button>
    </div>
  )
}

const ChecklistsPage = () => {
  return (
    <Layout title="Create Checklist">
      <Head>
        <title>Create Checklist</title>
      </Head>

      <div>
        <p>
          <Link href={Routes.NewChecklistPage()}>Create Checklist</Link>
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <ChecklistsList />
        </Suspense>
      </div>
    </Layout>
  )
}

export default ChecklistsPage

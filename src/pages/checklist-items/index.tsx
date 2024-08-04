import { Suspense } from 'react'
import { Routes } from '@blitzjs/next'
import Head from 'next/head'
import Link from 'next/link'
import { usePaginatedQuery } from '@blitzjs/rpc'
import { useRouter } from 'next/router'
import Layout from 'src/core/layouts/Layout'
import getChecklistItems from 'src/app/checklist-items/queries/getChecklistItems'

const ITEMS_PER_PAGE = 100

export const ChecklistItemsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ checklistItems, hasMore }] = usePaginatedQuery(getChecklistItems, {
    orderBy: { id: 'asc' },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <div>
      <ul>
        {checklistItems.map((checklistItem) => (
          <li key={checklistItem.id}>
            <Link
              href={Routes.ShowChecklistItemPage({
                checklistItemId: checklistItem.id,
              })}
            >
              {checklistItem.displayText}
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

const ChecklistItemsPage = () => {
  return (
    <Layout title="Checklist Items">
      <Head>
        <title>ChecklistItems</title>
      </Head>

      <div>
        <p>
          <Link href={Routes.NewChecklistItemPage()}>Create ChecklistItem</Link>
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <ChecklistItemsList />
        </Suspense>
      </div>
    </Layout>
  )
}

export default ChecklistItemsPage

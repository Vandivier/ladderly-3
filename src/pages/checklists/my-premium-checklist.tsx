import { BlitzPage } from '@blitzjs/auth'
import Link from 'next/link'
import { Suspense } from 'react'
import { UserChecklistQueryHandler } from 'src/app/user-checklists/components/UserChecklistQueryHandler'
import Layout from 'src/core/layouts/Layout'

const CURRENT_CHECKLIST_NAME = 'Advanced Programming Job Checklist'

const MyPremiumChecklist: BlitzPage = () => {
  return (
    <Layout title={CURRENT_CHECKLIST_NAME}>
      <div className="relative min-h-screen">
        <nav className="border-ladderly-light-purple flex border bg-ladderly-off-white px-4 py-1 text-ladderly-violet-700">
          <Link
            className="ml-auto text-gray-800 hover:text-ladderly-pink"
            href="/"
          >
            Back to Home
          </Link>
        </nav>
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="m-8 w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-xl">
            <h1 className="mb-4 text-2xl font-bold text-gray-800">
              {CURRENT_CHECKLIST_NAME}
            </h1>
            <Suspense fallback="Loading...">
              <UserChecklistQueryHandler name={CURRENT_CHECKLIST_NAME} />
            </Suspense>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default MyPremiumChecklist

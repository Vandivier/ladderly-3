import { Suspense } from 'react'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import ClientChecklist from './ClientChecklist'
import { api } from '~/trpc/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const checklistId = parseInt(params.id, 10)
  if (isNaN(checklistId)) {
    return {
      title: 'Invalid Checklist',
    }
  }

  const checklist = await api.checklist.getById({ id: checklistId })

  if (!checklist) {
    return {
      title: 'Checklist not found',
    }
  }

  return {
    title: `${checklist.name} | Ladderly`,
  }
}

export default async function ChecklistPage({
  params,
}: {
  params: { id: string }
}) {
  const checklistId = parseInt(params.id, 10)
  if (isNaN(checklistId)) {
    notFound()
  }

  const userChecklist = await api.checklist.getChecklistForUser({ checklistId })

  if (!userChecklist) {
    notFound()
  }

  return (
    <LadderlyPageWrapper authenticate>
      <div className="relative min-h-screen">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="m-4 w-full max-w-md rounded-lg border border-gray-200 bg-white p-4 shadow-xl">
            <Link
              href="/checklists"
              className="mb-2 block text-sm text-gray-500"
            >
              ← Back to Checklists
            </Link>
            <h1 className="mb-4 text-2xl font-bold text-gray-800">
              {userChecklist.checklist.name}
            </h1>

            <p className="mb-4 mt-2">
              Items with an asterisk (*) are required for certification.
            </p>

            <Suspense fallback="Loading...">
              <ClientChecklist initialUserChecklist={userChecklist} />
            </Suspense>
          </div>
        </div>
      </div>
    </LadderlyPageWrapper>
  )
}

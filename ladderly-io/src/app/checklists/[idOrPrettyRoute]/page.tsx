import { Suspense } from 'react'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import Link from 'next/link'
import ClientChecklist from './ClientChecklist'
import { notFound } from 'next/navigation'
import { api } from '~/trpc/server'
import { TRPCError } from '@trpc/server'
import { db } from '~/server/db'
import { auth, type LadderlyServerSession } from '~/server/better-auth'
import { headers } from 'next/headers'

export const metadata = {
  title: 'Checklist',
}

export default async function ChecklistPage({
  params,
}: {
  params: { idOrPrettyRoute: string }
}) {
  const session = await auth.api.getSession({
    headers: headers(),
  }) as LadderlyServerSession

  // Try to parse as number first
  const checklistId = parseInt(params.idOrPrettyRoute, 10)
  let checklist

  if (!isNaN(checklistId)) {
    checklist = await api.checklist.getById({ id: checklistId })
  } else {
    checklist = await api.checklist.getByPrettyRoute({
      prettyRoute: params.idOrPrettyRoute,
    })
  }

  if (!checklist) {
    notFound()
  }

  // We need to fetch the items separately for guests
  const { checklistItems } = await db.checklist.findUniqueOrThrow({
    where: { id: checklist.id },
    include: {
      checklistItems: {
        orderBy: {
          displayIndex: 'asc',
        },
      },
    },
  })
  const fullChecklist = { ...checklist, checklistItems }

  let userChecklist = null
  try {
    // This is a protected procedure and will fail for guests.
    userChecklist = await api.checklist.getChecklistForUser({
      checklistId: checklist.id,
    })
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'UNAUTHORIZED') {
      // This is the expected state for a guest user. We will proceed
      // without user-specific data, and the LadderlyPageWrapper will
      // handle prompting the user to sign in.
    } else {
      // For any other unexpected errors, we should fail the request.
      throw error
    }
  }

  return (
    <LadderlyPageWrapper authenticate requirePremium={checklist.isPremium}>
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
              {checklist.name}
            </h1>

            <p className="mb-4 mt-2">
              Items with an asterisk (*) are required for certification.
            </p>

            <Suspense fallback="Loading...">
              <ClientChecklist
                initialUserChecklist={userChecklist}
                latestChecklist={fullChecklist}
                session={session}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </LadderlyPageWrapper>
  )
}

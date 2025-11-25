import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { ChecklistsList } from './ChecklistsList'
import { api } from '~/trpc/server'
import { auth, type LadderlyServerSession } from '~/server/better-auth'
import { headers } from 'next/headers'

export const metadata = {
  title: 'Checklists',
  description: 'View and manage checklists for your programming career.',
}

export default async function ChecklistsPage() {
  // note: we statically render all checklists,
  // so if we have a bunch of checklists in the future, maybe 30+, we will want to paginate
  const { checklists } = await api.checklist.list({
    internalSecret: process.env.NEXTAUTH_SECRET,
  })
  const session = await auth.api.getSession({
    headers: headers(),
  }) as LadderlyServerSession

  return (
    <LadderlyPageWrapper>
      <div className="bg-gray-50">
        <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Career Growth Checklists
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-500">
              Your comprehensive guides to navigating the tech industry, one
              step at a time.
            </p>
          </div>

          <div className="mt-12">
            <ChecklistsList checklists={checklists} session={session} />
          </div>
        </div>
      </div>
    </LadderlyPageWrapper>
  )
}

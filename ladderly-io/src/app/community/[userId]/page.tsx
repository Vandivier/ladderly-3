import { Suspense } from 'react'
import { LargeCard } from '~/app/core/components/LargeCard'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { api } from '~/trpc/server'
import { TRPCError } from '@trpc/server'

// TODO: can we include user name in the title?
export const metadata = {
  title: 'Public Profile',
}

interface ChecklistType {
  id: number
  checklist: {
    name: string
    version: string
  }
  createdAt: Date
  isComplete: boolean
  updatedAt: Date
}

async function UserProfile({ userId }: { userId: number }) {
  try {
    const user = await api.user.getUser({ id: userId })

    return (
      <main>
        <h1 className="text-2xl">
          {user.nameFirst} {user.nameLast}
        </h1>

        <div className="my-4">
          <p>Blurb: {user.profileBlurb}</p>
          <p>
            Contact Email:{' '}
            <a
              href={`mailto:${user.profileContactEmail}`}
              className="text-blue-600 hover:text-blue-700"
            >
              {user.profileContactEmail}
            </a>
          </p>
          {user.profileGitHubUri ? (
            <p>
              GitHub:{' '}
              <a
                href={user.profileGitHubUri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                {user.profileGitHubUri}
              </a>
            </p>
          ) : null}
          {user.profileHomepageUri ? (
            <p>
              Homepage:{' '}
              <a
                href={user.profileHomepageUri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                {user.profileHomepageUri}
              </a>
            </p>
          ) : null}
          {user.profileLinkedInUri ? (
            <p>
              LinkedIn:{' '}
              <a
                href={user.profileLinkedInUri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                {user.profileLinkedInUri}
              </a>
            </p>
          ) : null}
        </div>

        {user.userChecklists.length > 0 ? (
          <>
            <h2 className="text-lg">Completed Checklists:</h2>
            <ul>
              {user.userChecklists.map((checklist: ChecklistType) => (
                <li className="my-1" key={checklist.id}>
                  <p>Checklist: {checklist.checklist.name}</p>
                  <p>Version: {checklist.checklist.version}</p>
                  <p>
                    Completed at:{' '}
                    {new Date(checklist.updatedAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>This user has not completed any checklists.</p>
        )}
      </main>
    )
  } catch (error) {
    if (error instanceof TRPCError) {
      if (error.code === 'UNAUTHORIZED') {
        return <div>This profile is private.</div>
      }
      if (error.code === 'NOT_FOUND') {
        return <div>User not found.</div>
      }
    }
    return <div>An error occurred while loading this profile.</div>
  }
}

export default async function ShowUserPage({
  params,
}: {
  params: { userId: string }
}) {
  const userId = parseInt(params.userId)

  return (
    <LadderlyPageWrapper>
      <LargeCard>
        <Suspense fallback={<div>Loading...</div>}>
          <UserProfile userId={userId} />
        </Suspense>
      </LargeCard>
    </LadderlyPageWrapper>
  )
}

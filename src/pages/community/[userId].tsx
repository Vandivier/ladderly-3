import { useParams } from '@blitzjs/next'
import { useQuery } from '@blitzjs/rpc'
import { Suspense } from 'react'

import getUser from 'src/app/users/queries/getUser'
import { LargeCard } from 'src/core/components/LargeCard'
import { LadderlyPageWrapper } from 'src/core/components/page-wrapper/LadderlyPageWrapper'

const UserProfile = () => {
  const { userId } = useParams()
  const [user] = useQuery(getUser, { id: Number(userId) })

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
            {user.userChecklists.map((checklist) => (
              <li className="my-1" key={checklist.id}>
                <p>Checklist: {checklist.checklist.name}</p>
                <p>Version: {checklist.checklist.version}</p>
                <p>
                  Completed at: {new Date(checklist.updatedAt).toLocaleString()}
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
}

const ShowUserPage = () => {
  return (
    <LadderlyPageWrapper title="Public Profile">
      <LargeCard>
        <Suspense fallback={<div>Loading...</div>}>
          <UserProfile />
        </Suspense>
      </LargeCard>
    </LadderlyPageWrapper>
  )
}

export default ShowUserPage

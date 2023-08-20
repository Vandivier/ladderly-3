import { useParams } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Suspense } from "react"

import getUser from "src/users/queries/getUser"
import { LadderlyPageWrapper } from "src/core/components/page-wrapper/LadderlyPageWrapper"
import { LargeCard } from "src/core/components/LargeCard"

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
        <p>Contact Email: {user.profileContactEmail}</p>
        <p>GitHub: {user.profileGitHubUri}</p>
        <p>Homepage: {user.profileHomepageUri}</p>
        <p>LinkedIn: {user.profileLinkedInUri}</p>
      </div>

      {user.userChecklists.length > 0 ? (
        <>
          <h2 className="text-lg">Completed Checklists:</h2>
          <ul>
            {user.userChecklists.map((checklist) => (
              <li className="my-1" key={checklist.id}>
                <p>Checklist: {checklist.checklist.name}</p>
                <p>Version: {checklist.checklist.version}</p>
                <p>Completed at: {new Date(checklist.updatedAt).toLocaleString()}</p>
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
    <LadderlyPageWrapper title="Ladderly | Community">
      <LargeCard>
        <Suspense fallback={<div>Loading...</div>}>
          <UserProfile />
        </Suspense>
      </LargeCard>
    </LadderlyPageWrapper>
  )
}

export default ShowUserPage

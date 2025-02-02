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
    const hasExperienceInfo =
      (user.profileYearsOfExperience ?? 0) > 0 &&
      (user.profileCurrentJobTitle ?? user.profileCurrentJobCompany)

    return (
      <main className="space-y-6">
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-bold">
            {user.nameFirst} {user.nameLast}
          </h1>
          <div className="mt-2 flex flex-wrap gap-2">
            {user.hasOpenToWork && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                Open to Work
              </span>
            )}
            {user.hasOpenToRelocation && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                Open to Relocation
              </span>
            )}
            {user.hasShoutOutsEnabled && (
              <span className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-800">
                Shout Outs Enabled
              </span>
            )}
          </div>
        </div>

        {/* About */}
        {user.profileBlurb && (
          <div>
            <h2 className="text-xl font-semibold">About</h2>
            <p className="whitespace-pre-wrap">{user.profileBlurb}</p>
          </div>
        )}

        {/* Contact and Links */}
        <div>
          <h2 className="text-xl font-semibold">Contact & Links</h2>
          <div className="mt-2 space-y-2">
            {user.profileContactEmail && (
              <p>
                <span className="font-medium">Email: </span>
                <a
                  href={`mailto:${user.profileContactEmail}`}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {user.profileContactEmail}
                </a>
              </p>
            )}
            {user.profileGitHubUri && (
              <p>
                <span className="font-medium">GitHub: </span>
                <a
                  href={user.profileGitHubUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  {user.profileGitHubUri}
                </a>
              </p>
            )}
            {user.profileHomepageUri && (
              <p>
                <span className="font-medium">Homepage: </span>
                <a
                  href={user.profileHomepageUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  {user.profileHomepageUri}
                </a>
              </p>
            )}
            {user.profileLinkedInUri && (
              <p>
                <span className="font-medium">LinkedIn: </span>
                <a
                  href={user.profileLinkedInUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  {user.profileLinkedInUri}
                </a>
              </p>
            )}
          </div>
        </div>

        {/* Skills and Services */}
        <div className="grid gap-6 md:grid-cols-2">
          {user.profileTopSkills?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold">Top Skills</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {user.profileTopSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {user.profileTopServices?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold">Services Offered</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {user.profileTopServices.map((service, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Networking */}
        {user.profileTopNetworkingReasons?.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold">Networking Interests</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {user.profileTopNetworkingReasons.map((reason, index) => (
                <span
                  key={index}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm"
                >
                  {reason}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Current Position */}
        {hasExperienceInfo && (
          <div>
            <h2 className="text-xl font-semibold">Experience</h2>
            {(user.profileCurrentJobTitle || user.profileCurrentJobCompany) && (
              <p>
                {user.profileCurrentJobTitle}
                {user.profileCurrentJobTitle &&
                  user.profileCurrentJobCompany &&
                  ' at '}
                {user.profileCurrentJobCompany}
              </p>
            )}
            {user.profileYearsOfExperience && (
              <p className="mt-1 text-gray-600">
                {user.profileYearsOfExperience} years of experience
              </p>
            )}
          </div>
        )}

        {/* Education */}
        {user.profileHighestDegree && (
          <div>
            <h2 className="text-xl font-semibold">Education</h2>
            <p className="text-gray-600">
              Highest Degree: {user.profileHighestDegree}
            </p>
          </div>
        )}

        {/* Completed Checklists */}
        {user.userChecklists.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold">Completed Checklists</h2>
            <ul className="mt-2 space-y-2">
              {user.userChecklists.map((checklist: ChecklistType) => (
                <li
                  key={checklist.id}
                  className="rounded-lg bg-gray-50 p-3 shadow-sm"
                >
                  <p className="font-medium">{checklist.checklist.name}</p>
                  <p className="text-sm text-gray-600">
                    Version: {checklist.checklist.version}
                  </p>
                  <p className="text-sm text-gray-600">
                    Completed: {new Date(checklist.updatedAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
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

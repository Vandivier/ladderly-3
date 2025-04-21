import { Suspense } from 'react'
import Link from 'next/link'
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

interface CertificateType {
  id: number
  createdAt: Date
  score: number
  passed: boolean
  quiz: {
    id: number
    name: string
    course: {
      id: number
      title: string
      slug: string
    } | null
  }
}

async function UserProfile({ userId }: { userId: number }) {
  try {
    const user = await api.user.getUser({ id: userId })
    const hasExperienceInfo =
      (user.profileYearsOfExperience ?? 0) > 0 &&
      (user.profileCurrentJobTitle ?? user.profileCurrentJobCompany)

    // Fetch certificates for the user
    const certificates = await api.certificate.getUserCertificates({ userId })

    // Filter out any certificates with missing data
    const validCertificates = certificates.filter(
      (cert) => cert.passed && cert.quiz && cert.quiz.name,
    )

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

        {/* Certificates */}
        {validCertificates.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold">Certificates</h2>
            <div className="mt-4 grid gap-4">
              {validCertificates.map((cert: CertificateType) => (
                <Link
                  key={cert.id}
                  href={`/community/${userId}/certificates/${cert.id}`}
                  className="flex flex-col rounded-lg border border-gray-200 bg-white px-4 py-2 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {cert.quiz.course?.title ?? 'Course'}
                  </div>
                  <div className="my-2 text-xs text-gray-500 dark:text-gray-400">
                    {cert.score === 100 && (
                      <span className="mr-2 rounded-full bg-yellow-100 px-2 py-0.5 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200">
                        Awarded With Honors
                      </span>
                    )}
                    <span>
                      Awarded: {new Date(cert.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
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
            {user.profileDiscordHandle && (
              <p>
                <span className="font-medium">Discord: </span>
                <a
                  href={`https://discord.com/users/${user.profileDiscordHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  {user.profileDiscordHandle}
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

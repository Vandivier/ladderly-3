import Link from 'next/link'

export type PublicUser = {
  id: number
  uuid: string
  createdAt: Date
  nameFirst: string | null
  nameLast: string | null
  hasPublicProfileEnabled: boolean

  hasShoutOutsEnabled: boolean
  hasOpenToWork: boolean
  profileBlurb: string | null
  profileContactEmail: string | null
  profileDiscordHandle: string | null
  profileGitHubUri: string | null
  profileHomepageUri: string | null
  profileLinkedInUri: string | null
  profileTopSkills: string[]
  profileYearsOfExperience: number | null
  profileHighestDegree?: string | null
  profileCurrentJobTitle?: string | null
  profileTopNetworkingReasons: string[]
  profileTopServices: string[]
}

interface CommunityMemberListItemProps {
  user: PublicUser
}

export const CommunityMemberListItem: React.FC<
  CommunityMemberListItemProps
> = ({ user }) => {
  const hasUserContactInfo =
    (user.profileContactEmail ?? user.profileLinkedInUri ?? '').length > 0

  return (
    <li className="rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col gap-2">
        {/* Name and Job Title */}
        <div>
          <Link
            href={`/community/${user.id}`}
            className="text-lg font-semibold hover:text-blue-600"
          >
            {user.nameFirst ? user.nameFirst : `User ${user.id}`}
            {user.nameLast ? ` ${user.nameLast}` : ''}
          </Link>
          {user.profileCurrentJobTitle && (
            <span className="ml-2 text-gray-600">
              • {user.profileCurrentJobTitle}
            </span>
          )}
        </div>

        {/* Status Chips */}
        <div className="flex flex-wrap gap-2">
          {user.hasOpenToWork && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
              Open to Work
            </span>
          )}
          {user.profileYearsOfExperience && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
              YOE: {user.profileYearsOfExperience}
            </span>
          )}
          {user.profileHighestDegree && (
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
              {user.profileHighestDegree}
            </span>
          )}
          {hasUserContactInfo && (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
              {user.profileContactEmail && user.profileLinkedInUri
                ? 'Email + LinkedIn'
                : user.profileContactEmail
                  ? 'Email'
                  : 'LinkedIn'}
            </span>
          )}
        </div>

        {/* Skills */}
        {user.profileTopSkills?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {user.profileTopSkills
              .slice(0, 3)
              .sort()
              .map((skill, index) => (
                <span
                  key={index}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-800"
                >
                  {skill}
                </span>
              ))}
          </div>
        )}

        {/* Services */}
        {user.profileTopServices?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {user.profileTopServices
              .slice(0, 3)
              .sort()
              .map((service, index) => (
                <span
                  key={index}
                  className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-800"
                >
                  {service}
                </span>
              ))}
          </div>
        )}

        {/* Networking Interests */}
        {user.profileTopNetworkingReasons?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {user.profileTopNetworkingReasons
              .slice(0, 3)
              .sort()
              .map((reason, index) => (
                <span
                  key={index}
                  className="rounded-full bg-purple-100 px-3 py-1 text-xs text-purple-800"
                >
                  {reason}
                </span>
              ))}
          </div>
        )}
      </div>
    </li>
  )
}

import Link from 'next/link'
import { getUserDisplayName } from '../core/utils'

// Full public user type for detailed views
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
  profilePicture?: string | null
}

// Simplified type for list view
export type CommunityMemberListUser = {
  id: number
  nameFirst: string | null
  nameLast: string | null
  hasPublicProfileEnabled: boolean
  hasOpenToWork: boolean
  profileContactEmail: string | null
  profileCurrentJobTitle: string | null
  profileLinkedInUri: string | null
  profileTopSkills: string[]
  profileTopNetworkingReasons: string[]
  profileTopServices: string[]
  profileYearsOfExperience: number | null
  profilePicture: string | null
  profileBlurb: string | null
}

interface CommunityMemberListItemProps {
  user: CommunityMemberListUser
}

export const CommunityMemberListItem = ({
  user,
}: CommunityMemberListItemProps) => {
  // Get up to 3 items for each category
  const topSkills = user.profileTopSkills?.slice(0, 3) || []
  const topNetworkingReasons =
    user.profileTopNetworkingReasons?.slice(0, 3) || []
  const topServices = user.profileTopServices?.slice(0, 3) || []

  // Construct the user's full name
  const fullName = getUserDisplayName({
    nameFirst: user.nameFirst,
    nameLast: user.nameLast,
    id: user.id,
  })

  return (
    <li className="rounded-lg border p-4 shadow-sm">
      <div className="flex flex-col gap-2">
        {/* First row: Name, title, YOE */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">
              <Link
                href={`/community/${user.id}`}
                className="hover:text-blue-600 hover:underline"
              >
                {fullName}
              </Link>
            </h3>
            <p className="text-sm text-gray-600">
              {user.profileCurrentJobTitle}
              {user.profileYearsOfExperience
                ? ` • ${user.profileYearsOfExperience} YOE`
                : ''}
            </p>
          </div>

          {/* Open to work badge */}
          {user.hasOpenToWork && (
            <span className="m-1 min-w-[102px] self-baseline rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
              Open to Work
            </span>
          )}
        </div>

        {/* Second row: All filter chips */}
        <div className="flex flex-wrap gap-1">
          {/* Skills */}
          {topSkills.map((skill) => (
            <span
              key={`skill-${skill}`}
              className="rounded-full bg-indigo-100 px-2 py-1 text-xs text-indigo-700"
            >
              {skill}
            </span>
          ))}

          {/* Networking reasons */}
          {topNetworkingReasons.map((reason) => (
            <span
              key={`networking-${reason}`}
              className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-700"
            >
              {reason}
            </span>
          ))}

          {/* Services */}
          {topServices.map((service) => (
            <span
              key={`service-${service}`}
              className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700"
            >
              {service}
            </span>
          ))}

          {/* Contact info indicators */}
          {user.profileContactEmail && user.profileLinkedInUri ? (
            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
              Email+LinkedIn
            </span>
          ) : user.profileContactEmail ? (
            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
              Email
            </span>
          ) : user.profileLinkedInUri ? (
            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
              LinkedIn
            </span>
          ) : null}
        </div>
      </div>
    </li>
  )
}

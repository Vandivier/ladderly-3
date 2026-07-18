import Link from 'next/link'
import { LargeCard } from '~/app/core/components/LargeCard'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { api } from '~/trpc/server'
import { JobPostOwnerActions } from '../components/JobPostOwnerActions'
import { describeContactBadge, formatSalaryRange } from '../utils'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'My Job Posts',
}

const MyJobPostsList = async () => {
  const posts = await api.jobBoard.getMyPosts()

  if (posts.length === 0) {
    return (
      <p>
        You have not posted any jobs yet.{' '}
        <Link className="underline" href="/jobs/post">
          Post your first job!
        </Link>
      </p>
    )
  }

  const now = new Date()

  return (
    <ul className="space-y-4">
      {posts.map((post) => {
        const isExpired = new Date(post.expiresAt) <= now
        const salaryRange = formatSalaryRange(
          post.baseSalaryMin,
          post.baseSalaryMax,
        )

        return (
          <li
            key={post.id}
            className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 ${
              isExpired ? 'opacity-60' : ''
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/jobs/${post.id}`}
                className="text-lg font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                {post.jobTitle} at {post.companyName}
              </Link>
              {isExpired && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                  Expired
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              {salaryRange && <span>{salaryRange}</span>}
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                {describeContactBadge(post.contactType, post.introJobFamilies)}
              </span>
              <span>
                {isExpired ? 'Expired' : 'Expires'}{' '}
                {new Date(post.expiresAt).toLocaleDateString()}
              </span>
            </div>
            <div className="mt-3">
              <JobPostOwnerActions postId={post.id} isExpired={isExpired} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default function MyJobPostsPage() {
  return (
    <LadderlyPageWrapper authenticate>
      <LargeCard>
        <h1 className="mb-4 text-2xl font-bold">My Job Posts</h1>
        <MyJobPostsList />
      </LargeCard>
    </LadderlyPageWrapper>
  )
}

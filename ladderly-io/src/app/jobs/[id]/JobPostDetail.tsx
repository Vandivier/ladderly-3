import { headers } from 'next/headers'
import Link from 'next/link'
import { auth, type LadderlyServerSession } from '~/server/better-auth'
import { api } from '~/trpc/server'
import { JobPostOwnerActions } from '../components/JobPostOwnerActions'
import {
  describeContactBadge,
  formatPosterName,
  formatSalaryRange,
} from '../utils'

export const JobPostDetail = async ({ postId }: { postId: number }) => {
  const session = (await auth.api.getSession({
    headers: headers(),
  })) as LadderlyServerSession | null

  let post
  try {
    post = await api.jobBoard.getPost({ id: postId })
  } catch {
    return (
      <div>
        <p>This job post does not exist or has expired.</p>
        <Link className="underline" href="/jobs">
          Back to the Job Board
        </Link>
      </div>
    )
  }

  const sessionUserId = session?.user?.id ? parseInt(session.user.id) : null
  const isOwner = sessionUserId === post.author.id
  const isExpired = new Date(post.expiresAt) <= new Date()
  const salaryRange = formatSalaryRange(post.baseSalaryMin, post.baseSalaryMax)

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {post.jobTitle} at {post.companyName}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          {post.location && <span>{post.location}</span>}
          {post.isRemote && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
              Remote
            </span>
          )}
          {salaryRange && <span className="font-medium">{salaryRange}</span>}
          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
            {describeContactBadge(post.contactType, post.introJobFamilies)}
          </span>
          {isExpired && (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
              Expired
            </span>
          )}
        </div>
      </div>

      {isOwner && (
        <JobPostOwnerActions postId={post.id} isExpired={isExpired} />
      )}

      {post.description && (
        <div>
          <h2 className="text-xl font-semibold">Description</h2>
          <p className="whitespace-pre-wrap">{post.description}</p>
        </div>
      )}

      {post.jobPostUrl && (
        <p>
          <span className="font-medium">Original posting: </span>
          <a
            href={post.jobPostUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700"
          >
            {post.jobPostUrl}
          </a>
        </p>
      )}

      <div>
        <h2 className="text-xl font-semibold">Your Connection</h2>
        <p className="mt-2">
          {post.contactType === 'POSTER'
            ? 'The poster is the direct contact for this job.'
            : 'The poster can intro you to someone at this company.'}{' '}
          Reach out via their public profile:
        </p>
        <Link
          href={`/community/${post.author.id}`}
          className="mt-2 inline-block rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          View {formatPosterName(post.author)}&apos;s Profile
        </Link>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        Posted {new Date(post.createdAt).toLocaleDateString()}
        {' · '}
        {isExpired ? 'Expired' : 'Expires'}{' '}
        {new Date(post.expiresAt).toLocaleDateString()}
      </p>

      <Link className="block underline" href="/jobs">
        Back to the Job Board
      </Link>
    </main>
  )
}

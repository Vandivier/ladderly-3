import { headers } from 'next/headers'
import Link from 'next/link'
import { auth, type LadderlyServerSession } from '~/server/better-auth'
import { api } from '~/trpc/server'
import { JobBoardPostForm } from '../../components/JobBoardPostForm'

export const EditJobPostContent = async ({ postId }: { postId: number }) => {
  const session = (await auth.api.getSession({
    headers: headers(),
  })) as LadderlyServerSession | null

  const sessionUserId = session?.user?.id ? parseInt(session.user.id) : null

  let post
  try {
    post = await api.jobBoard.getPost({ id: postId })
  } catch {
    post = null
  }

  if (!post || sessionUserId === null || post.author.id !== sessionUserId) {
    return (
      <div>
        <p>
          This job post does not exist or you do not have permission to edit
          it.
        </p>
        <Link className="underline" href="/jobs">
          Back to the Job Board
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Edit Job Post</h1>
      <JobBoardPostForm
        postId={post.id}
        initialValues={{
          companyName: post.companyName,
          jobTitle: post.jobTitle,
          description: post.description ?? '',
          jobPostUrl: post.jobPostUrl ?? '',
          location: post.location,
          isRemote: post.isRemote,
          baseSalaryMin: post.baseSalaryMin?.toString() ?? '',
          baseSalaryMax: post.baseSalaryMax?.toString() ?? '',
          contactType: post.contactType,
          introJobFamilies: post.introJobFamilies,
        }}
      />
    </div>
  )
}

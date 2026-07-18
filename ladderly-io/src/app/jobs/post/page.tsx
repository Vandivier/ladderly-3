import { headers } from 'next/headers'
import Link from 'next/link'
import { LargeCard } from '~/app/core/components/LargeCard'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { canPostJobs } from '~/server/api/routers/jobBoard/helpers'
import { auth, type LadderlyServerSession } from '~/server/better-auth'
import { api } from '~/trpc/server'
import { JobBoardPostForm } from '../components/JobBoardPostForm'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Post a Job',
}

const PostJobContent = async () => {
  const session = (await auth.api.getSession({
    headers: headers(),
  })) as LadderlyServerSession | null

  if (!session?.user) {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-bold">Post a Job</h1>
        <p>
          Please{' '}
          <Link className="underline" href="/login">
            log in
          </Link>{' '}
          or{' '}
          <Link className="underline" href="/signup">
            sign up
          </Link>{' '}
          to post a job.
        </p>
      </div>
    )
  }

  let settings
  try {
    settings = await api.user.getSettings()
  } catch {
    // e.g. email not yet verified
    settings = null
  }

  if (!settings || !canPostJobs(settings)) {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-bold">Post a Job</h1>
        <p>
          Every job on the Ladderly job board is transparently attached to a
          real person, so posting requires:
        </p>
        <ul className="my-4 list-disc pl-6">
          <li>A verified email</li>
          <li>A public profile</li>
          <li>A public LinkedIn URL or public contact email</li>
        </ul>
        <p>
          Update these on the{' '}
          <Link className="underline" href="/settings">
            Settings Page
          </Link>
          , then come back!
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Post a Job</h1>
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Your post will link to your public profile so candidates can reach you.
        Posts expire after one month.
      </p>
      <JobBoardPostForm />
    </div>
  )
}

export default function PostJobPage() {
  return (
    <LadderlyPageWrapper>
      <LargeCard>
        <PostJobContent />
      </LargeCard>
    </LadderlyPageWrapper>
  )
}

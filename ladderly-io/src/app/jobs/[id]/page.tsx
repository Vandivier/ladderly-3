import { LargeCard } from '~/app/core/components/LargeCard'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { api } from '~/trpc/server'
import { JobPostDetail } from './JobPostDetail'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: { id: string }
}) {
  try {
    const post = await api.jobBoard.getPost({ id: parseInt(params.id) })
    return {
      title: `${post.jobTitle} at ${post.companyName} | Ladderly Job Board`,
      description: post.description?.slice(0, 160) ?? undefined,
    }
  } catch {
    return { title: 'Job Post | Ladderly Job Board' }
  }
}

export default async function JobPostPage({
  params,
}: {
  params: { id: string }
}) {
  const postId = parseInt(params.id)

  return (
    <LadderlyPageWrapper>
      <LargeCard>
        <JobPostDetail postId={postId} />
      </LargeCard>
    </LadderlyPageWrapper>
  )
}

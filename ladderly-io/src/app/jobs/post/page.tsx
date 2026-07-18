import { LargeCard } from '~/app/core/components/LargeCard'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { PostJobContent } from './PostJobContent'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Post a Job',
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

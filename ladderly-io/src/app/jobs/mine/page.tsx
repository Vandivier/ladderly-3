import { LargeCard } from '~/app/core/components/LargeCard'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { MyJobPostsList } from './MyJobPostsList'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'My Job Posts',
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

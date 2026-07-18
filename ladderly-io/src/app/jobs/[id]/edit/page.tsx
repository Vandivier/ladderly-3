import { LargeCard } from '~/app/core/components/LargeCard'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import { EditJobPostContent } from './EditJobPostContent'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Edit Job Post',
}

export default function EditJobPostPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <LadderlyPageWrapper authenticate>
      <LargeCard>
        <EditJobPostContent postId={parseInt(params.id)} />
      </LargeCard>
    </LadderlyPageWrapper>
  )
}

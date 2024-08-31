// File: app/vote/[type]/page.tsx

import { Suspense } from 'react'
import { LadderlyPageWrapper } from 'src/core/components/page-wrapper/LadderlyPageWrapper'
import { isValidVotableType, slugToType } from 'src/app/votables/utils'
import VotePageContent from '../components/VotePageContent'

export default function VotePageWithTypeParam({
  params,
}: {
  params: { type: string }
}) {
  const votableType = slugToType(params.type)

  return (
    <LadderlyPageWrapper title="Vote">
      {isValidVotableType(votableType) ? (
        <Suspense fallback={<div>Loading...</div>}>
          <VotePageContent initialType={votableType} />
        </Suspense>
      ) : (
        <p>Invalid votable type</p>
      )}
    </LadderlyPageWrapper>
  )
}

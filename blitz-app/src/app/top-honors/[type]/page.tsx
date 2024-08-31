// File: app/top-honors/[type]/page.tsx

import { Suspense } from 'react'
import { LadderlyPageWrapper } from 'src/core/components/page-wrapper/LadderlyPageWrapper'
import { isValidVotableType, slugToType } from 'src/app/votables/utils'
import TopHonorsContent from '../components/TopHonorsContent'

export default function TopHonorsPageWithTypeParam({
  params,
}: {
  params: { type: string }
}) {
  const votableType = slugToType(params.type)

  return (
    <LadderlyPageWrapper title="Top Honors">
      <main className="m-4 flex flex-col items-center justify-center">
        {isValidVotableType(votableType) ? (
          <Suspense fallback={<div>Loading...</div>}>
            <TopHonorsContent initialType={votableType} />
          </Suspense>
        ) : (
          <p>Invalid votable type</p>
        )}
      </main>
    </LadderlyPageWrapper>
  )
}

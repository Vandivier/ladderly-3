import { Suspense } from 'react'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'

export const CourseContentPage = () => {
  return (
    <LadderlyPageWrapper authenticate requirePremium>
      <Suspense fallback={<div>Loading...</div>}>
        <p>REPLACE ME</p>
      </Suspense>
    </LadderlyPageWrapper>
  )
}

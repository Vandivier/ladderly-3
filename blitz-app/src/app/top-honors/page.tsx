// File: app/top-honors/page.tsx

import { Suspense } from 'react'
import { LadderlyPageWrapper } from 'src/core/components/page-wrapper/LadderlyPageWrapper'
import TopHonorsContent from './components/TopHonorsContent'

export default function TopHonorsPage() {
  return (
    <LadderlyPageWrapper title="Top Honors">
      <main className="m-4 flex flex-col items-center justify-center">
        <Suspense fallback={<div>Loading...</div>}>
          <TopHonorsContent />
        </Suspense>
      </main>
    </LadderlyPageWrapper>
  )
}

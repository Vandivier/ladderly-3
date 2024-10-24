// File: app/success/page.tsx

import { Suspense } from 'react'
import { LadderlyPageWrapper } from 'src/core/components/page-wrapper/LadderlyPageWrapper'
import StripeSuccessPageContent from './components/StripeSuccessPageContent'

export default function StripeSuccessPage() {
  return (
    <LadderlyPageWrapper title="Top Honors">
      <main className="m-4 flex flex-col items-center justify-center">
        <Suspense fallback={<div>Loading...</div>}>
          <StripeSuccessPageContent />
        </Suspense>
      </main>
    </LadderlyPageWrapper>
  )
}

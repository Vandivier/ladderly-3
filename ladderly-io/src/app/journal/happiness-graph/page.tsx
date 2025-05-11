import React from 'react'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'
import HappinessChart from './HappinessChart'

export default function HappinessGraphPage() {
  return (
    <LadderlyPageWrapper authenticate>
      <HappinessChart />
    </LadderlyPageWrapper>
  )
}

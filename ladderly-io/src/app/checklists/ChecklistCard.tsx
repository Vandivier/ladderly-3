'use client'

import { type Checklist, PaymentTierEnum } from '@prisma/client'
import Link from 'next/link'
import { type LadderlySession } from '~/server/auth'
import { PremiumLockIcon } from './PremiumLockIcon'

export const ChecklistCard: React.FC<{
  checklist: Checklist
  session: LadderlySession | null
}> = ({ checklist, session }) => {
  const checklistSubRoute = checklist.prettyRoute ?? checklist.id

  const userIsFreeTier =
    session?.user?.subscription?.tier === PaymentTierEnum.FREE
  const isGuest = !session
  const requiresUpgrade = checklist.isPremium && (userIsFreeTier || isGuest)

  return (
    <div className="group flex flex-row items-center justify-between gap-x-4 rounded-lg bg-white p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
      {requiresUpgrade && <PremiumLockIcon session={session} />}
      <Link
        href={`/checklists/${checklistSubRoute}`}
        className={`inline-flex flex-1 flex-col ${
          requiresUpgrade ? 'pointer-events-none' : ''
        }`}
      >
        <div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-ladderly-violet-600">
            {checklist.name}
          </h3>
        </div>
        <div className="mt-4">
          <span className="text-sm font-medium text-ladderly-violet-600 group-hover:underline">
            View Checklist →
          </span>
        </div>
      </Link>
    </div>
  )
}

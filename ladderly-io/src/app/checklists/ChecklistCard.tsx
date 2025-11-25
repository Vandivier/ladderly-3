'use client'

import { type Checklist, PaymentTierEnum } from '@prisma/client'
import Link from 'next/link'
import { type LadderlyServerSession } from '~/server/better-auth'
import { PremiumLockIcon } from './PremiumLockIcon'

export const ChecklistCard: React.FC<{
  checklist: Checklist
  session: LadderlyServerSession | null
  onLockClick: () => void
}> = ({ checklist, session, onLockClick }) => {
  const checklistSubRoute = checklist.prettyRoute ?? checklist.id

  const userIsFreeTier =
    session?.user?.subscription?.tier === PaymentTierEnum.FREE
  const isGuest = !session
  const requiresUpgrade = checklist.isPremium && (userIsFreeTier || isGuest)

  const CardContent = (
    <div className="inline-flex flex-1 flex-col">
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
    </div>
  )

  return (
    <div className="transition-transform-shadow group flex flex-row items-center justify-between gap-x-4 rounded-lg bg-white p-6 shadow-lg duration-300 hover:scale-105 hover:shadow-xl">
      {checklist.isPremium && <PremiumLockIcon onClick={onLockClick} />}
      {requiresUpgrade ? (
        <div className="flex-1 cursor-not-allowed opacity-50">
          {CardContent}
        </div>
      ) : (
        <Link href={`/checklists/${checklistSubRoute}`} className="flex-1">
          {CardContent}
        </Link>
      )}
    </div>
  )
}

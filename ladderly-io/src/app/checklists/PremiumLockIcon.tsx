'use client'

import { PaymentTierEnum } from '@prisma/client'
import { LockIcon } from 'lucide-react'
import { useState } from 'react'
import { type LadderlySession } from '~/server/auth'

export const PremiumLockIcon: React.FC<{
  session: LadderlySession | null
}> = ({ session }) => {
  const [showModal, setShowModal] = useState(false)

  const userIsFreeTier =
    session?.user?.subscription?.tier === PaymentTierEnum.FREE
  const isGuest = !session

  const requiresUpgrade = userIsFreeTier || isGuest

  if (!requiresUpgrade) return null

  const handleIconClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setShowModal(true)
  }

  return (
    <div className="flex items-center">
      <button
        onClick={handleIconClick}
        className="flex items-center justify-center rounded bg-ladderly-violet-100 p-1.5 text-ladderly-violet-500 transition-all hover:bg-ladderly-violet-500 hover:text-white"
      >
        <LockIcon className="size-4" />
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900">
              Premium Content
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              This checklist is available to premium subscribers. Upgrade your
              account to access this and other exclusive content.
            </p>
            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Close
              </button>
              <a
                href={
                  process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ??
                  '/#pricing-grid'
                }
                className="rounded-md border border-transparent bg-ladderly-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-ladderly-violet-700"
              >
                Upgrade
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

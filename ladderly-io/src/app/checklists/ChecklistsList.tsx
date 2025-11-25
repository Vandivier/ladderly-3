'use client'

import { useState } from 'react'
import { type LadderlyServerSession } from '~/server/better-auth'
import { type Checklist } from '@prisma/client'
import { ChecklistCard } from '~/app/checklists/ChecklistCard'

export const ChecklistsList: React.FC<{
  checklists: Checklist[]
  session: LadderlyServerSession | null
}> = ({ checklists, session }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const isGuest = !session
  const nextAction = isGuest ? 'Sign in' : 'Upgrade'
  const nextActionHref = isGuest
    ? '/login'
    : (process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? '/#pricing-grid')

  if (checklists.length === 0) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900">
          No Checklists Found
        </h3>
        <p className="mt-1 text-sm text-gray-500">Please check back later.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {checklists.map((checklist) => (
          <ChecklistCard
            key={checklist.id}
            checklist={checklist}
            session={session}
            onLockClick={() => setIsModalOpen(true)}
          />
        ))}
      </div>
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900">
              Premium Content
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              This checklist is available to premium subscribers.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              {nextAction} to access this and other exclusive content.
            </p>
            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Close
              </button>
              <a
                href={nextActionHref}
                className="rounded-md border border-transparent bg-ladderly-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-ladderly-violet-700"
              >
                {nextAction}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

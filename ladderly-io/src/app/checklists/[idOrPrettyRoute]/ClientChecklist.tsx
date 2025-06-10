'use client'

import React, { useState } from 'react'
import { api } from '~/trpc/react'
import type { RouterOutputs } from '~/trpc/react'
import { TRPCClientError } from '@trpc/client'
import type { Checklist } from '@prisma/client'
import { InfoIcon, X } from 'lucide-react'
import { LadderlyToast } from '~/app/core/components/LadderlyToast'

type UserChecklist = Exclude<
  RouterOutputs['checklist']['getChecklistForUser'],
  null
>
type UserChecklistItem = UserChecklist['userChecklistItems'][0]

const NewestChecklistQueryHandler: React.FC<{
  userChecklist: UserChecklist
  latestChecklist: Checklist
  onUpdate: () => void
}> = ({ userChecklist, latestChecklist, onUpdate }) => {
  const { mutateAsync: createUserChecklistAsClone } =
    api.checklist.createAsClone.useMutation({
      onSuccess: () => {
        onUpdate()
      },
    })

  const [showToast, setShowToast] = React.useState(
    userChecklist.checklistId !== latestChecklist.id,
  )
  const [toastMessage, setToastMessage] = React.useState(
    'A New Checklist Version is Available.',
  )

  const handleToastConfirmClick = async () => {
    setToastMessage('Update in progress...')
    try {
      await createUserChecklistAsClone({ checklistId: latestChecklist.id })
      setShowToast(false)
    } catch (error) {
      alert('Error updating checklist items.')
    }
  }

  const handleToastCloseClick = () => {
    setShowToast(false)
  }

  return showToast ? (
    <LadderlyToast
      message={toastMessage}
      onClick={handleToastConfirmClick}
      onClose={handleToastCloseClick}
    />
  ) : null
}

const UserChecklistItems: React.FC<{
  userChecklist: UserChecklist
  onToggle: (item: UserChecklistItem) => void
  isMutating: boolean
  mutatingItemId: number | undefined
}> = ({ userChecklist, onToggle, isMutating, mutatingItemId }) => {
  const [activeTooltip, setActiveTooltip] = React.useState<number | null>(null)

  const renderText = (text: string, linkUri?: string, linkText?: string) => {
    if (!linkUri) return text

    const parts = text.split('###LINK###')
    if (parts.length === 1) return text

    return (
      <>
        {parts[0]}
        <a
          href={linkUri}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ladderly-pink hover:underline"
        >
          {linkText ?? 'here'}
        </a>
        {parts[1]}
      </>
    )
  }
  return (
    <ul className="space-y-4">
      {userChecklist.userChecklistItems.map((item) => (
        <li key={item.id} className="flex items-start space-x-2">
          <input
            type="checkbox"
            checked={item.isComplete}
            onChange={() => onToggle(item)}
            className="mt-1 size-4 rounded border-gray-300"
            disabled={isMutating && mutatingItemId === item.id}
          />
          <div className="relative flex-1">
            <div className="flex items-start gap-1">
              <span className="text-gray-800">
                {renderText(
                  item.checklistItem.displayText,
                  item.checklistItem.linkUri,
                  item.checklistItem.linkText,
                )}
                {item.checklistItem.isRequired && '*'}
              </span>
              {item.checklistItem.detailText && (
                <button
                  onClick={() =>
                    setActiveTooltip(activeTooltip === item.id ? null : item.id)
                  }
                  className="mt-1 text-gray-500 hover:text-gray-700"
                >
                  <InfoIcon className="size-4" />
                </button>
              )}
            </div>
            {activeTooltip === item.id && item.checklistItem.detailText && (
              <div className="absolute left-0 top-6 z-10 w-full max-w-sm rounded-lg border-4 border-ladderly-violet-700/50 bg-white p-3 shadow-lg">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    {renderText(
                      item.checklistItem.detailText,
                      item.checklistItem.linkUri,
                      item.checklistItem.linkText,
                    )}
                  </div>
                  <button
                    onClick={() => setActiveTooltip(null)}
                    className="-mr-1 -mt-1 text-gray-500 hover:text-gray-700"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function ClientChecklist({
  initialUserChecklist,
  latestChecklist,
}: {
  initialUserChecklist: UserChecklist
  latestChecklist: Checklist
}) {
  const [userChecklist, setUserChecklist] = useState(initialUserChecklist)
  const [error, setError] = useState<string | null>(null)
  const utils = api.useUtils()

  const {
    mutate: toggleItem,
    isPending,
    variables,
  } = api.checklist.toggleItem.useMutation({
    onSuccess: (updatedItem) => {
      setUserChecklist((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          userChecklistItems: prev.userChecklistItems.map((item) =>
            item.id === updatedItem.id
              ? { ...item, isComplete: updatedItem.isComplete }
              : item,
          ),
        }
      })
    },
    onError: (err) => {
      if (err instanceof TRPCClientError) {
        setError(err.message)
      } else {
        setError('An unknown error occurred')
      }
    },
  })

  const handleToggle = (item: UserChecklistItem) => {
    setError(null)
    toggleItem({
      userChecklistItemId: item.id,
      isComplete: !item.isComplete,
    })
  }

  const handleUpdate = () => {
    void utils.checklist.getChecklistForUser.invalidate({
      checklistId: latestChecklist.id,
    })
    // NOTE: This is a bit of a hack to force a refresh
    window.location.reload()
  }

  return (
    <div>
      <NewestChecklistQueryHandler
        userChecklist={userChecklist}
        latestChecklist={latestChecklist}
        onUpdate={handleUpdate}
      />
      {error && <p className="text-red-500">{error}</p>}
      <UserChecklistItems
        userChecklist={userChecklist}
        onToggle={handleToggle}
        isMutating={isPending}
        mutatingItemId={variables?.userChecklistItemId}
      />
    </div>
  )
}

'use client'

import { useState } from 'react'
import { api } from '~/trpc/react'
import type { RouterOutputs } from '~/trpc/react'
import { TRPCClientError } from '@trpc/client'

type UserChecklist = Exclude<
  RouterOutputs['checklist']['getChecklistForUser'],
  null
>
type UserChecklistItem = UserChecklist['userChecklistItems'][0]

export default function ClientChecklist({
  initialUserChecklist,
}: {
  initialUserChecklist: UserChecklist
}) {
  const [userChecklist, setUserChecklist] = useState(initialUserChecklist)
  const [error, setError] = useState<string | null>(null)

  const toggleMutation = api.checklist.toggleItem.useMutation({
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
    toggleMutation.mutate({
      userChecklistItemId: item.id,
      isComplete: !item.isComplete,
    })
  }

  return (
    <div>
      {error && <p className="text-red-500">{error}</p>}
      <ul className="space-y-2">
        {userChecklist.userChecklistItems.map((item) => (
          <li key={item.id} className="flex items-center">
            <input
              type="checkbox"
              checked={item.isComplete}
              onChange={() => handleToggle(item)}
              className="mr-2 h-4 w-4 rounded border-gray-300 text-ladderly-violet-600 focus:ring-ladderly-violet-500"
              disabled={
                toggleMutation.isPending &&
                toggleMutation.variables?.userChecklistItemId === item.id
              }
            />
            <label htmlFor={`item-${item.id}`} className="flex-grow">
              {item.checklistItem.displayText}
              {item.checklistItem.isRequired && ' *'}
            </label>
            {item.checklistItem.linkUri && (
              <a
                href={item.checklistItem.linkUri}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-sm text-blue-500 hover:underline"
              >
                ({item.checklistItem.linkText || 'more info'})
              </a>
            )}
          </li>
        ))}
      </ul>
      {userChecklist.userChecklistItems.some(
        (item) => item.checklistItem.detailText,
      ) && (
        <div className="mt-4 space-y-2 text-sm text-gray-600">
          {userChecklist.userChecklistItems.map(
            (item) =>
              item.checklistItem.detailText && (
                <p key={item.id}>
                  <strong className="font-semibold">
                    {item.checklistItem.displayText}:
                  </strong>{' '}
                  {item.checklistItem.detailText}
                </p>
              ),
          )}
        </div>
      )}
    </div>
  )
}

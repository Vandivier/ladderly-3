'use client'

import React from 'react'
import { LadderlyToast } from '~/app/core/components/LadderlyToast'
import { api } from '~/trpc/react'
import { InfoIcon, X } from 'lucide-react'

const CURRENT_CHECKLIST_NAME = 'Advanced Programming Job Checklist'

const NewestChecklistQueryHandler: React.FC = () => {
  const utils = api.useUtils()
  const { data: userChecklistData } = api.checklist.getLatestByName.useQuery({
    name: CURRENT_CHECKLIST_NAME,
  })

  const { mutateAsync: createUserChecklistAsClone } =
    api.checklist.createAsClone.useMutation({
      onSuccess: () => {
        void utils.checklist.getLatestByName.invalidate({
          name: CURRENT_CHECKLIST_NAME,
        })
      },
    })

  const [showToast, setShowToast] = React.useState(
    userChecklistData?.userChecklistCascade.userChecklist?.checklistId !==
      userChecklistData?.latestChecklistId,
  )
  const [toastMessage, setToastMessage] = React.useState(
    'A New Checklist Version is Available.',
  )

  const handleToastConfirmClick = async () => {
    const checklistId = userChecklistData?.latestChecklistId
    if (!checklistId) return
    setToastMessage('Update in progress...')

    try {
      await createUserChecklistAsClone({ checklistId })
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

const UserChecklistItems: React.FC = () => {
  const utils = api.useUtils()
  const { data: userChecklistData } = api.checklist.getLatestByName.useQuery({
    name: CURRENT_CHECKLIST_NAME,
  })
  const [activeTooltip, setActiveTooltip] = React.useState<number | null>(null)

  const { mutate: toggleItem } = api.checklist.toggleItem.useMutation({
    onSuccess: () => {
      void utils.checklist.getLatestByName.invalidate({
        name: CURRENT_CHECKLIST_NAME,
      })
    },
  })

  if (!userChecklistData?.userChecklistCascade.userChecklist) {
    return <div>No checklist found.</div>
  }

  const { userChecklistItems } =
    userChecklistData.userChecklistCascade.userChecklist

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
      {userChecklistItems.map((item) => (
        <li key={item.id} className="flex items-start space-x-2">
          <input
            type="checkbox"
            checked={item.isComplete}
            onChange={() =>
              toggleItem({
                userChecklistItemId: item.id,
                isComplete: !item.isComplete,
              })
            }
            className="mt-1 size-4 rounded border-gray-300"
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
              <div className="absolute left-0 top-6 z-10 w-full max-w-sm rounded-lg border-4 border-ladderly-violet-700 bg-white p-3 shadow-lg ring-1 ring-black/5">
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

export const ClientPremiumChecklist = () => (
  <>
    <NewestChecklistQueryHandler />
    <UserChecklistItems />
  </>
)

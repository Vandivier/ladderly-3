import { useMutation, useQuery } from "@blitzjs/rpc"
import Link from "next/link"
import React from "react"

import updateUserChecklistItem from "src/user-checklist-items/mutations/updateUserChecklistItem"
import getLatestUserChecklistByName from "src/user-checklists/queries/getLatestUserChecklistByName"
import { UserChecklistItemWithChecklistItem } from "src/user-checklists/schemas"

const MAGIC_LINK_SUBSTR = "###LINK###"

const UserChecklistItemList = ({
  items,
  refetchChecklist,
}: {
  items: UserChecklistItemWithChecklistItem[]
  refetchChecklist: () => Promise<any>
}) => {
  const [updateUserChecklistItemMutation] = useMutation(updateUserChecklistItem)
  const sorted = items.sort(
    (a, b) => a.checklistItem.displayIndex - b.checklistItem.displayIndex
  )

  const handleItemClick = async (id, isComplete) => {
    try {
      await updateUserChecklistItemMutation({ id, isComplete: !isComplete })
      await refetchChecklist()
    } catch (error) {
      alert("Error updating checklist item " + JSON.stringify(error, null, 2))
    }
  }

  return (
    <ol className="list-decimal">
      {sorted.map((item) => {
        const checklistItem = item.checklistItem
        return (
          <li
            className="mb-3 hover:cursor-pointer"
            key={item.id}
            onClick={async () =>
              await handleItemClick(item.id, item.isComplete)
            }
          >
            <input
              type="checkbox"
              checked={item.isComplete}
              readOnly
              className="mr-2"
            />

            {checklistItem.isRequired ? (
              <span className="font-bold">*</span>
            ) : null}

            {checklistItem.displayText
              .split(MAGIC_LINK_SUBSTR)
              .map((part, index, array) => {
                if (
                  checklistItem.linkText &&
                  checklistItem.linkUri &&
                  index < array.length - 1
                ) {
                  return (
                    <React.Fragment key={index}>
                      {part}
                      <Link
                        href={checklistItem.linkUri}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold hover:underline"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {checklistItem.linkText}
                      </Link>
                    </React.Fragment>
                  )
                } else {
                  return part
                }
              })}
          </li>
        )
      })}
    </ol>
  )
}

export const UserChecklistQueryHandler: React.FC<{ name: string }> = ({
  name,
}) => {
  const [currUserChecklistData, { refetch }] = useQuery(
    getLatestUserChecklistByName,
    {
      name,
      shouldUpsertIfMalformed: true,
    }
  )

  if (!currUserChecklistData.userChecklistWithChecklistItems) {
    return (
      <>
        <p>Checklist not found. Consider these options:</p>
        <ol className="list-inside list-decimal">
          <li>Click the green button to create a new checklist.</li>
          <li>Refresh the page.</li>
          <li>Log out and log back in.</li>
          <li>
            If the above steps do not resolve the issue, please report the issue
            using the{" "}
            <Link
              className="ml-auto text-gray-800 hover:text-ladderly-pink"
              href="https://discord.gg/fAg6Xa4uxc"
              target="_blank"
            >
              Ladderly Discord
            </Link>
            .
          </li>
        </ol>
      </>
    )
  }

  return currUserChecklistData ? (
    <UserChecklistItemList
      items={
        currUserChecklistData.userChecklistWithChecklistItems.userChecklistItems
      }
      refetchChecklist={refetch}
    />
  ) : null
}

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
    }
  )

  return currUserChecklistData ? (
    <UserChecklistItemList
      items={
        currUserChecklistData.userChecklistCascade.userChecklist
          .userChecklistItems
      }
      refetchChecklist={refetch}
    />
  ) : null
}

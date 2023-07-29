import { BlitzPage } from "@blitzjs/auth"
import { Routes } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import Link from "next/link"
import React, { Fragment, Suspense } from "react"

import { LadderlyToast } from "src/core/components/LadderlyToast"
import Layout from "src/core/layouts/Layout"
import updateUserChecklistItem from "src/user-checklist-items/mutations/updateUserChecklistItem"
import createUserChecklist from "src/user-checklists/mutations/createUserChecklist"
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
      {items.map((item) => {
        const checklistItem = item.checklistItem
        return (
          <li
            className="mb-3 hover:cursor-pointer"
            key={item.id}
            onClick={async () => await handleItemClick(item.id, item.isComplete)}
          >
            <input type="checkbox" checked={item.isComplete} readOnly className="mr-2" />
            {checklistItem.displayText.split(MAGIC_LINK_SUBSTR).map((part, index, array) => {
              if (checklistItem.linkText && checklistItem.linkUri && index < array.length - 1) {
                return (
                  <Fragment key={index}>
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
                  </Fragment>
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

const NewestChecklistQueryHandler: React.FC = () => {
  const [createUserChecklistMutation] = useMutation(createUserChecklist)
  const [userChecklistData, { refetch }] = useQuery(getLatestUserChecklistByName, {
    name: "Programming Job Checklist",
  })
  const [showToast, setShowToast] = React.useState(userChecklistData?.isLatestVersion!)
  const [toastMessage, setToastMessage] = React.useState("A New Checklist Version is Available.")

  const handleToastConfirmClick = async () => {
    const checklistId = userChecklistData?.latestChecklist?.id
    if (!checklistId) return
    setToastMessage("Update in progress...")

    try {
      await createUserChecklistMutation({ checklistId })
      await refetch()
      setShowToast(false)
    } catch (error) {
      alert("Error updating checklist items.")
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

const ChecklistItemQueryHandler: React.FC = () => {
  const [currUserChecklistData, { refetch }] = useQuery(getLatestUserChecklistByName, {
    name: "Programming Job Checklist",
  })

  return currUserChecklistData ? (
    <UserChecklistItemList
      items={currUserChecklistData.userChecklistWithChecklistItems.userChecklistItems}
      refetchChecklist={refetch}
    />
  ) : null
}

const MyBasicChecklist: BlitzPage = () => {
  return (
    <Layout title="My Standard Checklist">
      <div className="relative min-h-screen">
        <nav className="border-ladderly-light-purple text-ladderly-violet-700et-700 flex border bg-ladderly-off-white px-4 py-1">
          <Link className="ml-auto text-gray-800 hover:text-ladderly-pink" href={Routes.Home()}>
            Back to Home
          </Link>
        </nav>

        <Suspense>
          <NewestChecklistQueryHandler />
        </Suspense>

        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="m-8 w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-xl">
            <h1 className="mb-4 text-2xl font-bold text-gray-800">My Standard Checklist</h1>
            <Suspense fallback="Loading...">
              <ChecklistItemQueryHandler />
            </Suspense>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default MyBasicChecklist

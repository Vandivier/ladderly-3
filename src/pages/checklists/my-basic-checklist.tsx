import { BlitzPage } from "@blitzjs/auth"
import { Routes } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import Link from "next/link"
import React from "react"
import { Fragment, Suspense } from "react"

import getUserChecklistByName, {
  UserChecklistItemWithChecklistItem,
} from "src/checklists/queries/getUserChecklistByName"
import { LadderlyToast } from "src/core/components/LadderlyToast"
import Layout from "src/core/layouts/Layout"
import updateUserChecklistItem from "src/user-checklist-items/mutations/updateUserChecklistItem"

const MAGIC_LINK_SUBSTR = "###LINK###"

const UserChecklistItemList = ({
  items,
  refetchChecklist,
}: {
  items: UserChecklistItemWithChecklistItem[]
  refetchChecklist: () => void
}) => {
  const [updateUserChecklistItemMutation] = useMutation(updateUserChecklistItem)

  const handleItemClick = async (id, isComplete) => {
    try {
      await updateUserChecklistItemMutation({ id, isComplete: !isComplete })
      refetchChecklist()
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

const ChecklistQueryHandler: React.FC = () => {
  const [userChecklistData, { refetch }] = useQuery(getUserChecklistByName, {
    name: "Programming Job Checklist",
  })

  return (
    <UserChecklistItemList
      items={userChecklistData.userChecklistItemsWithChecklistItem}
      refetchChecklist={refetch}
    />
  )
}

const MyBasicChecklist: BlitzPage = () => {
  const [showToast, setShowToast] = React.useState(true)

  const handleToastClick = () => {
    setShowToast(false)
  }

  return (
    <Layout title="My Standard Checklist">
      <div className="relative min-h-screen">
        <nav className="border-ladderly-light-purple text-ladderly-violet-700et-700 flex border bg-ladderly-off-white px-4 py-1">
          <Link className="ml-auto text-gray-800 hover:text-ladderly-pink" href={Routes.Home()}>
            Back to Home
          </Link>
        </nav>

        {showToast ? (
          <LadderlyToast
            message="A New Checklist Version is Available."
            onClick={handleToastClick}
            onClose={handleToastClick}
          />
        ) : null}

        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="m-8 w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-xl">
            <h1 className="mb-4 text-2xl font-bold text-gray-800">My Standard Checklist</h1>
            <Suspense fallback="Loading...">
              <ChecklistQueryHandler />
            </Suspense>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default MyBasicChecklist

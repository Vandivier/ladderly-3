import getUserChecklistByName from "src/checklists/queries/getUserChecklistByName"

import { BlitzPage } from "@blitzjs/auth"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { Suspense } from "react"

import { Routes } from "@blitzjs/next"
import Link from "next/link"
import updateChecklistItem from "src/checklist-items/mutations/updateChecklistItem"
import Layout from "src/core/layouts/Layout"

const ChecklistItems = ({ checklistItems, refetchChecklist }) => {
  const [updateChecklistItemMutation] = useMutation(updateChecklistItem)

  const handleItemClick = async (id, isComplete) => {
    try {
      await updateChecklistItemMutation({ id, isComplete: !isComplete })
      refetchChecklist()
    } catch (error) {
      alert("Error updating checklist item " + JSON.stringify(error, null, 2))
    }
  }

  return (
    <ol className="list-decimal">
      {checklistItems.map((item) => (
        <li
          className="mb-3 hover:cursor-pointer"
          key={item.id}
          onClick={async () => await handleItemClick(item.id, item.isComplete)}
        >
          <input type="checkbox" checked={item.isComplete} readOnly className="mr-2" />
          {item.displayText}
        </li>
      ))}
    </ol>
  )
}

const ChecklistQueryHandler: React.FC = () => {
  const [userChecklist, { refetch }] = useQuery(getUserChecklistByName, {
    name: "Programming Job Checklist",
  })

  return (
    <ChecklistItems
      checklistItems={userChecklist.checklist.checklistItems}
      refetchChecklist={refetch}
    />
  )
}

const MyBasicChecklist: BlitzPage = () => {
  return (
    <Layout title="My Standard Checklist">
      <div className="relative min-h-screen">
        <nav className="border-ladderly-light-purple flex border bg-ladderly-off-white px-4 py-1 text-ladderly-teal">
          <Link className="ml-auto text-gray-800 hover:text-ladderly-pink" href={Routes.Home()}>
            Back to Home
          </Link>
        </nav>
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

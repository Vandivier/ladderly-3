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
          className="hover:cursor-pointer mb-3"
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
    <Layout title="My Basic Checklist">
      <div className="relative min-h-screen">
        <nav className="bg-ladderly-off-white border border-ladderly-light-purple text-ladderly-teal flex py-1 px-4">
          <Link className="ml-auto text-gray-800 hover:text-ladderly-pink" href={Routes.Home()}>
            Back to Home
          </Link>
        </nav>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="w-full max-w-md bg-white m-8 p-8 rounded-lg shadow-xl border border-gray-200">
            <h1 className="text-gray-800 font-bold text-2xl mb-4">My Basic Checklist</h1>
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

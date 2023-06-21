import getUserChecklistByName from "src/checklists/queries/getUserChecklistByName"

import { BlitzPage } from "@blitzjs/auth"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { Suspense } from "react"

import Layout from "src/core/layouts/Layout"
import updateChecklistItem from "src/checklist-items/mutations/updateChecklistItem"

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
    <ul>
      {checklistItems.map((item) => (
        <li
          key={item.id}
          onClick={() => {
            handleItemClick(item.id, item.isComplete)
          }}
        >
          <input type="checkbox" checked={item.isComplete} readOnly />
          {item.displayText}
        </li>
      ))}
    </ul>
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
      <h1>My Basic Checklist</h1>
      <Suspense fallback="Loading...">
        <ChecklistQueryHandler />
      </Suspense>
    </Layout>
  )
}

export default MyBasicChecklist

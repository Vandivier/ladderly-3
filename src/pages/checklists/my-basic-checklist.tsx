import getUserChecklistByName from "src/checklists/queries/getUserChecklistByName"

import { BlitzPage } from "@blitzjs/auth"
import { useQuery } from "@blitzjs/rpc"
import { Suspense } from "react"

import Layout from "src/core/layouts/Layout"

const ChecklistItems = ({ checklistItems }) => {
  return (
    <ul>
      {checklistItems.map((item) => (
        <li key={item.id}>{item.displayText}</li>
      ))}
    </ul>
  )
}

const ChecklistQueryHandler: React.FC = () => {
  const [userChecklist] = useQuery(getUserChecklistByName, {
    name: "Programming Job Checklist",
  })

  console.log({ userChecklist })

  return <ChecklistItems checklistItems={userChecklist.checklist.checklistItems} />
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

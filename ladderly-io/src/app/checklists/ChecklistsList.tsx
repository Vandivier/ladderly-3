import { ChecklistCard } from './ChecklistCard'
import type { RouterOutputs } from '~/trpc/react'

type Checklist = RouterOutputs['checklist']['list']['checklists'][number]

export function ChecklistsList({ checklists }: { checklists: Checklist[] }) {
  if (checklists.length === 0) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900">
          No Checklists Found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          We couldn't find any checklists. Please check back later.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {checklists.map((checklist) => (
        <ChecklistCard key={checklist.id} checklist={checklist} />
      ))}
    </div>
  )
}

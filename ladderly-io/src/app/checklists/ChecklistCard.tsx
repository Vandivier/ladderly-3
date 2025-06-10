import { Checklist } from '@prisma/client'
import Link from 'next/link'
import { LockIcon } from 'lucide-react'

export const ChecklistCard: React.FC<{ checklist: Checklist }> = ({
  checklist,
}) => {
  const checklistSubRoute = checklist.prettyRoute ?? checklist.id
  return (
    <Link
      href={`/checklists/${checklistSubRoute}`}
      className="group flex flex-row justify-between gap-x-4 rounded-lg bg-white p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
    >
      {checklist.isPremium && (
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center justify-center rounded bg-ladderly-violet-100 p-1.5 text-ladderly-violet-500 transition-all hover:bg-ladderly-violet-500 hover:text-white">
            <LockIcon className="size-4" />
          </span>
        </div>
      )}
      <div className="inline-flex flex-col">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-ladderly-violet-600">
            {checklist.name}
          </h3>
        </div>
        <div className="mt-4">
          <span className="text-sm font-medium text-ladderly-violet-600 group-hover:underline">
            View Checklist →
          </span>
        </div>
      </div>
    </Link>
  )
}

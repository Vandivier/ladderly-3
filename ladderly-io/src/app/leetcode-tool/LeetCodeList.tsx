'use client'

import { useSearchParams } from 'next/navigation'
import { api } from '~/trpc/react'

interface LeetCodeProblemProps {
  id: number
  displayText: string
  linkUri: string
  tags: string[]
  isComplete: boolean
  onToggle: (id: number, isComplete: boolean) => void
}

function LeetCodeProblem({
  id,
  displayText,
  linkUri,
  tags,
  isComplete,
  onToggle,
}: LeetCodeProblemProps) {
  // Extract source from tags (format: "source:xyz")
  const sourceTag = tags.find((tag) => tag.startsWith('source:'))
  const source = sourceTag ? sourceTag.replace('source:', '') : 'unknown'

  return (
    <tr>
      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isComplete}
            onChange={() => onToggle(id, !isComplete)}
            className="mr-3 size-4 rounded border-gray-300"
          />
          {displayText}
        </div>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
        {source}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-blue-500">
        <a
          href={linkUri}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Solve
        </a>
      </td>
    </tr>
  )
}

export function LeetCodeList() {
  const searchParams = useSearchParams()
  const sourceFilter = searchParams.get('source') ?? 'all'
  const utils = api.useUtils()

  const { data: checklistData, isLoading } =
    api.checklist.getLatestByName.useQuery({
      name: 'LeetCode Problems',
    })

  const { mutate: toggleItem } = api.checklist.toggleItem.useMutation({
    onSuccess: () => {
      void utils.checklist.getLatestByName.invalidate({
        name: 'LeetCode Problems',
      })
    },
  })

  const handleToggleItem = (itemId: number, isComplete: boolean) => {
    toggleItem({
      userChecklistItemId: itemId,
      isComplete,
    })
  }

  if (isLoading) {
    return <div className="py-4 text-center">Loading problems...</div>
  }

  if (!checklistData?.userChecklistCascade.userChecklist) {
    return <div className="py-4 text-center">No problems found.</div>
  }

  const { userChecklistItems } =
    checklistData.userChecklistCascade.userChecklist

  // Filter items by source if needed
  const filteredItems =
    sourceFilter === 'all'
      ? userChecklistItems
      : userChecklistItems.filter((item) => {
          const sourceTags = item.checklistItem.tags.filter((tag) =>
            tag.startsWith('source:'),
          )
          return (
            sourceTags.includes(`source:${sourceFilter}`) ||
            sourceTags.includes('source:multiple')
          )
        })

  if (filteredItems.length === 0) {
    return (
      <div className="py-4 text-center">
        No problems found with the selected filter. Try adjusting your filters.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Showing {filteredItems.length} problems{' '}
        {sourceFilter !== 'all' ? `from ${sourceFilter}` : ''}
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Problem
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Source
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Link
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredItems.map((item) => (
              <LeetCodeProblem
                key={item.id}
                id={item.id}
                displayText={item.checklistItem.displayText}
                linkUri={item.checklistItem.linkUri}
                tags={item.checklistItem.tags}
                isComplete={item.isComplete}
                onToggle={handleToggleItem}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

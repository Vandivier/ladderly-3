'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
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
          <a
            href={linkUri}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {displayText}
          </a>
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
  const searchParams = useSearchParams() ?? new URLSearchParams()
  const sourceFilter = searchParams.get('source') ?? 'all'
  const statusFilter = searchParams.get('status') ?? 'all'
  const searchQuery = searchParams.get('search') ?? ''
  const patternFilter = searchParams.get('pattern') ?? 'All Patterns'
  const difficultyFilter = searchParams.get('difficulty') ?? 'All Difficulties'
  const utils = api.useUtils()

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

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

  // Apply source and completion status filters
  let filteredItems = userChecklistItems

  // Filter by search query
  if (searchQuery) {
    filteredItems = filteredItems.filter((item) =>
      item.checklistItem.displayText
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
    )
  }

  // Filter by pattern tag if selected
  if (patternFilter && patternFilter !== 'All Patterns') {
    const requiredTag = `pattern:${patternFilter}`
    filteredItems = filteredItems.filter((item) =>
      item.checklistItem.tags.includes(requiredTag),
    )
  }

  // Filter by difficulty tag if selected
  if (difficultyFilter && difficultyFilter !== 'All Difficulties') {
    const requiredDifficultyTag = `difficulty:${difficultyFilter}`
    filteredItems = filteredItems.filter((item) =>
      item.checklistItem.tags.includes(requiredDifficultyTag),
    )
  }

  // First filter by source if needed
  if (sourceFilter !== 'all') {
    filteredItems = filteredItems.filter((item) => {
      const sourceTags = item.checklistItem.tags.filter((tag) =>
        tag.startsWith('source:'),
      )
      return sourceTags.includes(`source:${sourceFilter}`)
    })
  }

  // Then filter by completion status
  if (statusFilter === 'solved') {
    filteredItems = filteredItems.filter((item) => item.isComplete)
  } else if (statusFilter === 'unsolved') {
    filteredItems = filteredItems.filter((item) => !item.isComplete)
  }

  // Calculate pagination values
  const totalItems = filteredItems.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Adjust current page if needed
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages)
  }

  // Get current page items
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
  const currentItems = filteredItems.slice(startIndex, endIndex)

  if (filteredItems.length === 0) {
    return (
      <div className="py-4 text-center">
        No problems found with the selected filters. Try adjusting your filters.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Showing {startIndex + 1}-{endIndex} of {totalItems} problems
        {sourceFilter !== 'all' ? ` from ${sourceFilter}` : ''}
        {statusFilter === 'solved'
          ? ', solved only'
          : statusFilter === 'unsolved'
            ? ', unsolved only'
            : ''}
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
            {currentItems.map((item) => (
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

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{endIndex}</span> of{' '}
                <span className="font-medium">{totalItems}</span> results
              </p>
            </div>
            <div>
              <nav
                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20"
                >
                  <span className="sr-only">First</span>⟪
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center border border-gray-300 bg-white p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20"
                >
                  <span className="sr-only">Previous</span>← Prev
                </button>
                <span className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center border border-gray-300 bg-white p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20"
                >
                  <span className="sr-only">Next</span>
                  Next →
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white p-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20"
                >
                  <span className="sr-only">Last</span>⟫
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

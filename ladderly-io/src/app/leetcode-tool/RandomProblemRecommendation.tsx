'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { api } from '~/trpc/react'

type CompletionStatus = 'all' | 'solved' | 'unsolved'

// Define an interface for the problem structure
interface LeetCodeProblem {
  id: number
  title: string
  url: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  source?: string
  topics?: string[]
  isComplete: boolean
}

export const RandomProblemRecommendation = () => {
  const searchParams = useSearchParams() ?? new URLSearchParams()
  const statusFilter = (searchParams.get('status') as CompletionStatus) ?? 'all'
  const sourceFilter = searchParams.get('source') ?? 'all'
  const [refreshKey, setRefreshKey] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Get checklist data - this is an independent server call
  const { data: checklistData, isLoading: isLoadingData } =
    api.checklist.getLatestByName.useQuery(
      { name: 'LeetCode Problems' },
      {
        // This prevents unnecessary requests
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    )

  // Derived state for the random problem
  const [randomProblem, setRandomProblem] = useState<LeetCodeProblem | null>(
    null,
  )

  // Select a random problem whenever filters or refreshKey changes
  useEffect(() => {
    if (isLoadingData || !checklistData?.userChecklistCascade.userChecklist) {
      setIsLoading(true)
      return
    }

    setIsLoading(true)

    // Get all problems
    const allItems =
      checklistData.userChecklistCascade.userChecklist.userChecklistItems

    // Apply filters
    let filteredItems = [...allItems]

    // Filter by source
    if (sourceFilter !== 'all') {
      filteredItems = filteredItems.filter((item) => {
        const sourceTags = item.checklistItem.tags.filter((tag) =>
          tag.startsWith('source:'),
        )
        return (
          sourceTags.includes(`source:${sourceFilter}`) ||
          sourceTags.includes('source:multiple')
        )
      })
    }

    // Filter by completion status
    if (statusFilter === 'solved') {
      filteredItems = filteredItems.filter((item) => item.isComplete)
    } else if (statusFilter === 'unsolved') {
      filteredItems = filteredItems.filter((item) => !item.isComplete)
    }

    // Select a random problem
    if (filteredItems.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredItems.length)
      const selectedItem = filteredItems[randomIndex]

      // Make sure selectedItem exists
      if (selectedItem && selectedItem.checklistItem) {
        // Create a better structured problem object
        const sourceTag = selectedItem.checklistItem.tags.find((tag) =>
          tag.startsWith('source:'),
        )
        const source = sourceTag ? sourceTag.replace('source:', '') : 'unknown'

        // Get topics from tags (format: "topic:xyz")
        const topics = selectedItem.checklistItem.tags
          .filter((tag) => tag.startsWith('topic:'))
          .map((tag) => tag.replace('topic:', ''))

        // Get difficulty from tags (format: "difficulty:xyz")
        const difficultyTag = selectedItem.checklistItem.tags.find((tag) =>
          tag.startsWith('difficulty:'),
        )
        const difficultyValue = difficultyTag
          ? difficultyTag.replace('difficulty:', '')
          : 'Medium'

        // Convert to our standard difficulty format
        let difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium'
        if (difficultyValue.toLowerCase().includes('easy')) {
          difficulty = 'Easy'
        } else if (difficultyValue.toLowerCase().includes('hard')) {
          difficulty = 'Hard'
        }

        setRandomProblem({
          id: selectedItem.id,
          title: selectedItem.checklistItem.displayText,
          url: selectedItem.checklistItem.linkUri,
          difficulty,
          source,
          topics,
          isComplete: selectedItem.isComplete,
        })
      } else {
        setRandomProblem(null)
      }
    } else {
      setRandomProblem(null)
    }

    setIsLoading(false)
  }, [checklistData, sourceFilter, statusFilter, refreshKey, isLoadingData])

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  if (isLoading || isLoadingData) {
    return (
      <div className="mb-6 animate-pulse rounded-lg bg-gray-100 p-6 dark:bg-gray-800">
        <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-700"></div>
        <div className="mt-4 h-4 w-1/2 bg-gray-300 dark:bg-gray-700"></div>
      </div>
    )
  }

  if (!randomProblem) {
    return (
      <div className="mb-6 rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20">
        <p className="text-blue-700 dark:text-blue-300">
          No problems found with the current filters. Adjust your filters to get
          a recommendation.
        </p>
      </div>
    )
  }

  return (
    <div className="mb-4 rounded-lg bg-blue-50 p-4 dark:border dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-blue-700 dark:text-blue-300">
          Recommended Problem:
        </h2>
        <button
          onClick={handleRefresh}
          className="rounded-md bg-blue-500 px-3 py-1 text-sm text-white transition hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="mt-2">
        <div className="flex items-center gap-2">
          <a
            href={randomProblem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-800 hover:underline dark:text-blue-100"
          >
            {randomProblem.title}
          </a>

          <span
            className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
              randomProblem.isComplete
                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {randomProblem.isComplete ? 'Completed' : 'Incomplete'}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              randomProblem.difficulty === 'Easy'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                : randomProblem.difficulty === 'Medium'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
            }`}
          >
            {randomProblem.difficulty}
          </span>

          {randomProblem.source && (
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
              {randomProblem.source}
            </span>
          )}

          {randomProblem.topics?.map((topic, index) => (
            <span
              key={index}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-800 dark:bg-gray-700 dark:text-gray-300"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RandomProblemRecommendation

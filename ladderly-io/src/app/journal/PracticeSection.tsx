'use client'

import React, { useState } from 'react'
import { api } from '~/trpc/react'

// Helper to get appropriate icon for practice category
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'COMMUNICATION':
      return '💬'
    case 'LEADERSHIP':
      return '👑'
    case 'OWNERSHIP':
      return '🔑'
    case 'TECHNICAL':
      return '💻'
    case 'PERSUASION':
      return '🎯'
    case 'PERSONAL':
      return '🧘'
    default:
      return '📝'
  }
}

export const PracticeSection = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined,
  )
  const [isExpanded, setIsExpanded] = useState(false)

  // Get practice items based on selected category
  const { data: practices = [], isLoading } =
    api.journal.getPracticeItems.useQuery({
      category: selectedCategory as any,
    })

  // Get recent completions for the current day
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { data: todayCompletions = [], refetch: refetchCompletions } =
    api.journal.getUserPracticeCompletions.useQuery({
      fromDate: today,
    })

  // Log practice completion mutation
  const { mutate: logCompletion, isLoading: isLogging } =
    api.journal.logPracticeCompletion.useMutation({
      onSuccess: () => {
        refetchCompletions()
      },
    })

  // Handle completing a practice
  const handleComplete = (practiceId: number) => {
    logCompletion({ practiceId })
  }

  // Check if practice has been completed today
  const isPracticeCompletedToday = (practiceId: number) => {
    return todayCompletions.some(
      (completion) => completion.practiceId === practiceId,
    )
  }

  // Get a random practice suggestion from available practices
  const getRandomPractice = () => {
    if (practices.length === 0) return null

    // Filter out practices that have been completed today
    const availablePractices = practices.filter(
      (practice) => !isPracticeCompletedToday(practice.id),
    )

    if (availablePractices.length === 0) return null

    // Return a random practice from the available ones
    return availablePractices[
      Math.floor(Math.random() * availablePractices.length)
    ]
  }

  // Get random practice for suggestion
  const randomPractice = getRandomPractice()

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-gray-500">Loading practice items...</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Daily Practice</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-500 hover:text-blue-700"
        >
          {isExpanded ? 'Hide' : 'Show'}
        </button>
      </div>

      {isExpanded && (
        <div>
          {/* Today's completion count */}
          <div className="mb-4">
            <p className="text-sm text-gray-700">
              You've completed{' '}
              <span className="font-medium text-blue-600">
                {todayCompletions.length}
              </span>{' '}
              practices today!
            </p>
          </div>

          {/* Random practice suggestion */}
          <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <h4 className="mb-2 text-base font-medium">Suggested Practice</h4>

            {randomPractice ? (
              <div>
                <div className="mb-2 flex items-center">
                  <span className="mr-2 text-xl">
                    {getCategoryIcon(randomPractice.category)}
                  </span>
                  <span className="font-medium">{randomPractice.name}</span>
                </div>
                <p className="mb-3 text-sm text-gray-700">
                  {randomPractice.description}
                </p>
                <button
                  onClick={() => handleComplete(randomPractice.id)}
                  disabled={isLogging}
                  className="rounded bg-blue-500 px-3 py-1 text-sm font-medium text-white hover:bg-blue-600 disabled:bg-gray-300"
                >
                  {isLogging ? 'Marking...' : 'Mark as Done'}
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Great job! You've completed all available practices for today.
              </p>
            )}
          </div>

          {/* Category filter */}
          <div className="mb-4">
            <label
              htmlFor="category"
              className="mb-1 block text-sm font-medium"
            >
              Filter by Category
            </label>
            <select
              id="category"
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || undefined)}
              className="w-full rounded border border-gray-300 p-2 text-sm"
            >
              <option value="">All Categories</option>
              <option value="COMMUNICATION">Communication</option>
              <option value="LEADERSHIP">Leadership</option>
              <option value="OWNERSHIP">Ownership</option>
              <option value="TECHNICAL">Technical</option>
              <option value="PERSUASION">Persuasion</option>
              <option value="PERSONAL">Personal</option>
            </select>
          </div>

          {/* List of practice items */}
          <div className="space-y-3">
            {practices.length === 0 ? (
              <p className="text-center text-sm text-gray-500">
                No practice items found for this category.
              </p>
            ) : (
              practices.map((practice) => {
                const isCompleted = isPracticeCompletedToday(practice.id)

                return (
                  <div
                    key={practice.id}
                    className={`rounded-lg border p-3 ${
                      isCompleted
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="mr-2 text-xl">
                          {getCategoryIcon(practice.category)}
                        </span>
                        <div>
                          <h5 className="font-medium">{practice.name}</h5>
                          <p className="text-xs text-gray-500">
                            {practice.category}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleComplete(practice.id)}
                        disabled={isLogging || isCompleted}
                        className={`rounded px-3 py-1 text-xs font-medium ${
                          isCompleted
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {isCompleted ? 'Completed' : 'Complete'}
                      </button>
                    </div>

                    <p className="mt-1 text-sm text-gray-700">
                      {practice.description}
                    </p>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PracticeSection

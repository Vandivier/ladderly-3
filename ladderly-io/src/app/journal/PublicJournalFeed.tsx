'use client'

import React, { useCallback, useMemo, useState } from 'react'
import { api } from '~/trpc/react'
import { JournalEntryCard } from './JournalEntryCard'

type AllowedEntryType = 'WIN' | 'PAIN_POINT' | 'LEARNING' | 'OTHER'

export const PublicJournalFeed = () => {
  const [entryType, setEntryType] = useState<AllowedEntryType | undefined>(
    undefined,
  )
  const [includeCareer, setIncludeCareer] = useState<boolean>(true)
  const [includePersonal, setIncludePersonal] = useState<boolean>(true)
  const [textFilter, setTextFilter] = useState<string>('')
  const [appliedFilters, setAppliedFilters] = useState({
    entryType: undefined as AllowedEntryType | undefined,
    isCareerRelated: undefined as boolean | undefined,
    textFilter: '',
  })
  const [cursor, setCursor] = useState<number | undefined>(undefined)
  const [showFilters, setShowFilters] = useState<boolean>(false)

  // Memoize query parameters to prevent unnecessary re-renders and API calls
  const queryParams = useMemo(
    () => ({
      limit: 10,
      cursor,
      entryType: appliedFilters.entryType,
      isCareerRelated: appliedFilters.isCareerRelated,
      textFilter: appliedFilters.textFilter || undefined,
    }),
    [cursor, appliedFilters],
  )

  // Get public journal entries with filters
  const { data, isLoading } = api.journal.getPublicEntries.useQuery(
    queryParams,
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 60000, // 1 minute
    },
  )

  // Apply filters when the submit button is clicked
  const applyFilters = useCallback(() => {
    // Determine isCareerRelated based on checkbox states
    let careerRelatedValue: boolean | undefined = undefined

    // Both checkboxes enabled = show all (undefined)
    // Only career enabled = true
    // Only personal enabled = false
    // Neither enabled = undefined (show all, same as both)

    if (includeCareer && !includePersonal) {
      careerRelatedValue = true
    } else if (!includeCareer && includePersonal) {
      careerRelatedValue = false
    }

    setAppliedFilters({
      entryType,
      isCareerRelated: careerRelatedValue,
      textFilter: textFilter.trim(),
    })

    // Reset cursor when applying new filters
    setCursor(undefined)
  }, [entryType, includeCareer, includePersonal, textFilter])

  // Reset all filters - memoize the function
  const resetFilters = useCallback(() => {
    setEntryType(undefined)
    setIncludeCareer(true)
    setIncludePersonal(true)
    setTextFilter('')
    setAppliedFilters({
      entryType: undefined,
      isCareerRelated: undefined,
      textFilter: '',
    })
    setCursor(undefined)
  }, [])

  // Format date to readable string - memoize the function
  const formatDate = useCallback((date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }, [])

  if (isLoading) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400">
        Loading public entries...
      </p>
    )
  }

  const entries = data?.entries ?? []
  const nextCursor = data?.nextCursor
  const totalCount = data?.totalCount ?? 0

  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <p className="mb-4 text-gray-500 dark:text-gray-400">
          No public journal entries found.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {Object.values({
            entryType: appliedFilters.entryType,
            isCareerRelated: appliedFilters.isCareerRelated,
            textFilter: appliedFilters.textFilter,
          }).some((v) => v !== undefined && v !== '')
            ? 'Try adjusting your filters or be the first to share your career journey!'
            : 'Be the first to share your career journey with the community!'}
        </p>
        {Object.values({
          entryType: appliedFilters.entryType,
          isCareerRelated: appliedFilters.isCareerRelated,
          textFilter: appliedFilters.textFilter,
        }).some((v) => v !== undefined && v !== '') && (
          <button
            onClick={resetFilters}
            className="mt-3 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Reset Filters
          </button>
        )}
      </div>
    )
  }

  return (
    <div>
      <div
        id="post-filter-controls"
        className={`mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 ${
          showFilters ? '' : 'hidden'
        }`}
      >
        <div className="flex flex-col space-y-4">
          {/* Entry Type Selector */}
          <div>
            <label
              htmlFor="entryType"
              className="mb-1 block text-sm font-medium dark:text-gray-300"
            >
              Type:
            </label>
            <select
              id="entryType"
              value={entryType ?? ''}
              onChange={(e) =>
                setEntryType((e.target.value as AllowedEntryType) || undefined)
              }
              className="rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="">All</option>
              <option value="WIN">Win</option>
              <option value="PAIN_POINT">Pain Point</option>
              <option value="LEARNING">Learning</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Category Checkboxes */}
          <div>
            <p className="mb-1 block text-sm font-medium dark:text-gray-300">
              Category:
            </p>
            <div className="flex space-x-4">
              <label className="flex items-center text-sm font-medium dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={includeCareer}
                  onChange={(e) => setIncludeCareer(e.target.checked)}
                  className="mr-1"
                />
                Career-Related
              </label>

              <label className="flex items-center text-sm font-medium dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={includePersonal}
                  onChange={(e) => setIncludePersonal(e.target.checked)}
                  className="mr-1"
                />
                Personal
              </label>
            </div>
          </div>

          {/* Text Filter */}
          <div>
            <label
              htmlFor="textFilter"
              className="mb-1 block text-sm font-medium dark:text-gray-300"
            >
              Search Text:
            </label>
            <input
              type="text"
              id="textFilter"
              value={textFilter}
              onChange={(e) => setTextFilter(e.target.value)}
              placeholder="Search by keyword or #hashtag"
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          {/* Filter Action Buttons */}
          <div className="flex justify-end space-x-2">
            <button
              onClick={resetFilters}
              className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Reset
            </button>
            <button
              onClick={applyFilters}
              className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Entry count with filter toggle */}
      <div className="mb-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div>
          Showing {entries.length} of {totalCount} entries
        </div>
        <div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <span className="mr-1">🔍</span>
            <span>Filter Posts</span>
          </button>
        </div>
      </div>

      {/* Entries list */}
      <div className="space-y-4">
        {entries.map((entry) => (
          <JournalEntryCard
            key={entry.id}
            entry={entry}
            formatDate={formatDate}
            isPublicFeed={true}
          />
        ))}
      </div>

      {/* Pagination */}
      {nextCursor && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setCursor(nextCursor)}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  )
}

export default PublicJournalFeed

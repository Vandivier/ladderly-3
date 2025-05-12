'use client'

import type { JournalEntryType } from '@prisma/client'
import React, { useCallback, useMemo, useState } from 'react'
import { api } from '~/trpc/react'
import { HappinessSlider } from './HappinessSlider'
import { BarChart3, Heart, Share2 } from 'lucide-react'
import Link from 'next/link'
import { JournalEntryCard, EntryTypeIcon } from './JournalEntryCard'

// Use a type that matches the API's expected values
type AllowedEntryType = 'WIN' | 'PAIN_POINT' | 'LEARNING' | 'OTHER'

// Helper function to format content with highlighted hashtags
export const formatContentWithHashtags = (content: string) => {
  // Regular expression to find hashtags
  const hashtagRegex = /(#[a-zA-Z0-9_]+)/g

  // Split content by hashtag matches
  const parts = content.split(hashtagRegex)

  return parts.map((part, index) => {
    // If part matches hashtag pattern, render it with highlighting
    if (part.match(hashtagRegex)) {
      return (
        <span
          key={index}
          className="rounded-full bg-yellow-100 px-1.5 py-0.5 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
        >
          {part}
        </span>
      )
    }
    // Otherwise render as regular text
    return <React.Fragment key={index}>{part}</React.Fragment>
  })
}

// Edit form for a journal entry
interface JournalEntryEditFormProps {
  id: number
  content: string
  entryType: AllowedEntryType
  isCareerRelated: boolean
  happiness?: number
  isPublic: boolean
  isUpdating: boolean
  onChangeContent: (content: string) => void
  onChangeEntryType: (type: AllowedEntryType) => void
  onChangeIsCareerRelated: (isCareerRelated: boolean) => void
  onChangeHappiness: (happiness?: number) => void
  onChangeIsPublic: (isPublic: boolean) => void
  onCancel: () => void
  onSave: () => void
}

const JournalEntryEditForm: React.FC<JournalEntryEditFormProps> = ({
  id,
  content,
  entryType,
  isCareerRelated,
  happiness,
  isPublic,
  isUpdating,
  onChangeContent,
  onChangeEntryType,
  onChangeIsCareerRelated,
  onChangeHappiness,
  onChangeIsPublic,
  onCancel,
  onSave,
}) => {
  return (
    <div className="mt-2 space-y-3">
      <textarea
        value={content}
        onChange={(e) => onChangeContent(e.target.value)}
        className="w-full rounded border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
        rows={3}
        maxLength={500}
        disabled={isUpdating}
      />

      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label
            htmlFor={`edit-type-${id}`}
            className="mb-1 block text-sm font-medium dark:text-gray-300"
          >
            Entry Type
          </label>
          <select
            id={`edit-type-${id}`}
            value={entryType}
            onChange={(e) =>
              onChangeEntryType(e.target.value as AllowedEntryType)
            }
            className="rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            disabled={isUpdating}
          >
            <option value="WIN">Win</option>
            <option value="PAIN_POINT">Pain Point</option>
            <option value="LEARNING">Learning</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Happiness slider */}
        <div>
          <HappinessSlider
            value={happiness}
            onChange={onChangeHappiness}
            disabled={isUpdating}
            id={`edit-happiness-${id}`}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id={`edit-career-${id}`}
            checked={isCareerRelated}
            onChange={(e) => onChangeIsCareerRelated(e.target.checked)}
            className="mr-1 size-4"
            disabled={isUpdating}
          />
          <label
            htmlFor={`edit-career-${id}`}
            className="text-sm font-medium dark:text-gray-300"
          >
            Career-Related
          </label>
        </div>
      </div>

      <div className="mb-2 flex items-center">
        <input
          type="checkbox"
          id={`edit-public-${id}`}
          checked={isPublic}
          onChange={(e) => onChangeIsPublic(e.target.checked)}
          className="mr-2 h-4 w-4 rounded border-gray-300 text-ladderly-violet-600 focus:ring-ladderly-violet-500 dark:border-gray-600 dark:bg-gray-700"
          disabled={isUpdating}
        />
        <label
          htmlFor={`edit-public-${id}`}
          className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Share publicly in community feed
        </label>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          onClick={onCancel}
          className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          disabled={isUpdating}
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          disabled={isUpdating}
        >
          {isUpdating ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}

export const JournalEntryList = () => {
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
  // Track which entry is being edited and its properties
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState<string>('')
  const [editEntryType, setEditEntryType] = useState<AllowedEntryType>('WIN')
  const [editIsCareerRelated, setEditIsCareerRelated] = useState<boolean>(true)
  const [editHappiness, setEditHappiness] = useState<number | undefined>(
    undefined,
  )
  const [isPublic, setIsPublic] = useState<boolean>(false)

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

  // Get journal entries with filters
  const { data, isLoading, refetch } = api.journal.getUserEntries.useQuery(
    queryParams,
    {
      // This prevents multiple unnecessary requests
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
    },
  )

  // Delete journal entry mutation
  const { mutate: deleteEntry } = api.journal.deleteEntry.useMutation({
    onSuccess: async () => {
      await refetch()
    },
  })

  // Update journal entry mutation
  const { mutate: updateEntry, isPending: isUpdating } =
    api.journal.updateEntry.useMutation({
      onSuccess: async () => {
        await refetch()
        setEditingEntryId(null)
        setEditContent('')
        setEditEntryType('WIN')
        setEditIsCareerRelated(true)
        setEditHappiness(undefined)
        setIsPublic(false)
      },
    })

  // Handle delete entry - memoize the function to prevent re-creation
  const handleDelete = useCallback(
    (id: number) => {
      if (confirm('Are you sure you want to delete this journal entry?')) {
        deleteEntry({ id })
      }
    },
    [deleteEntry],
  )

  // Handle edit entry
  const handleEdit = useCallback(
    (entry: {
      id: number
      content: string
      entryType: JournalEntryType
      isCareerRelated: boolean
      happiness?: number | null
      isPublic: boolean
    }) => {
      setEditingEntryId(entry.id)
      setEditContent(entry.content)
      setEditEntryType(entry.entryType as AllowedEntryType)
      setEditIsCareerRelated(entry.isCareerRelated)
      setEditHappiness(entry.happiness === null ? undefined : entry.happiness)
      setIsPublic(entry.isPublic)
    },
    [],
  )

  // Handle save edited entry
  const handleSaveEdit = useCallback(
    (id: number) => {
      updateEntry({
        id,
        content: editContent,
        entryType: editEntryType,
        isCareerRelated: editIsCareerRelated,
        happiness: editHappiness,
        isPublic,
      })
    },
    [
      updateEntry,
      editContent,
      editEntryType,
      editIsCareerRelated,
      editHappiness,
      isPublic,
    ],
  )

  // Handle cancel edit
  const handleCancelEdit = useCallback(() => {
    setEditingEntryId(null)
    setEditContent('')
    setEditEntryType('WIN')
    setEditIsCareerRelated(true)
    setEditHappiness(undefined)
    setIsPublic(false)
  }, [])

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
        Loading journal entries...
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
          No journal entries found.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {Object.values({
            entryType: appliedFilters.entryType,
            isCareerRelated: appliedFilters.isCareerRelated,
            textFilter: appliedFilters.textFilter,
          }).some((v) => v !== undefined && v !== '')
            ? 'Try adjusting your filters or create your first entry.'
            : 'Create your first entry to get started!'}
        </p>
        {Object.values({
          entryType: appliedFilters.entryType,
          isCareerRelated: appliedFilters.isCareerRelated,
          textFilter: appliedFilters.textFilter,
        }).some((v) => v !== undefined && v !== '') && (
          <button
            onClick={resetFilters}
            onSubmit={resetFilters}
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
              onSubmit={resetFilters}
              className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Reset
            </button>
            <button
              onClick={applyFilters}
              onSubmit={applyFilters}
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
        <div className="flex items-center gap-2">
          <Link
            href={'/journal/happiness-graph' as const}
            className="flex items-center rounded bg-gray-100 px-2 py-1 text-purple-600 hover:bg-purple-200 dark:bg-gray-700 dark:text-purple-300 dark:hover:bg-gray-600"
            title="View Happiness Graph"
          >
            <Heart className="mr-1 size-4 text-pink-500" />
            <BarChart3 className="size-4" />
          </Link>
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
          <div key={entry.id}>
            {editingEntryId === entry.id ? (
              <JournalEntryEditForm
                id={entry.id}
                content={editContent}
                entryType={editEntryType}
                isCareerRelated={editIsCareerRelated}
                happiness={editHappiness}
                isPublic={isPublic}
                isUpdating={isUpdating}
                onChangeContent={setEditContent}
                onChangeEntryType={setEditEntryType}
                onChangeIsCareerRelated={setEditIsCareerRelated}
                onChangeHappiness={setEditHappiness}
                onChangeIsPublic={setIsPublic}
                onCancel={handleCancelEdit}
                onSave={() => handleSaveEdit(entry.id)}
              />
            ) : (
              <div className="relative">
                <JournalEntryCard entry={entry} formatDate={formatDate} />
                {/* Action Buttons*/}
                <div className="absolute right-4 top-4 flex space-x-2">
                  {/* Edit button */}
                  <button
                    onClick={() => handleEdit(entry)}
                    className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    aria-label="Edit entry"
                    disabled={editingEntryId !== null}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    aria-label="Delete entry"
                    disabled={editingEntryId !== null}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
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

export default JournalEntryList

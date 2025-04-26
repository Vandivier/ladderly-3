'use client'

import React, { useState } from 'react'
import { api } from '~/trpc/react'
import { useRouter } from 'next/navigation'
import type { JournalEntryType } from '@prisma/client'

interface WorkstreamChipsProps {
  workstreams: { name: string }[]
}

// Small component to display workstream chips
const WorkstreamChips: React.FC<WorkstreamChipsProps> = ({ workstreams }) => {
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {workstreams.map((workstream) => (
        <span
          key={workstream.name}
          className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700"
        >
          {workstream.name}
        </span>
      ))}
    </div>
  )
}

interface EntryTypeIconProps {
  type: JournalEntryType
}

// Component to display entry type icon
const EntryTypeIcon: React.FC<EntryTypeIconProps> = ({ type }) => {
  let iconClass = ''
  let bgClass = ''
  let label = ''

  switch (type) {
    case 'WIN':
      iconClass = '🏆'
      bgClass = 'bg-green-100 text-green-700'
      label = 'Win'
      break
    case 'PAIN_POINT':
      iconClass = '😓'
      bgClass = 'bg-red-100 text-red-700'
      label = 'Pain Point'
      break
    case 'LEARNING':
      iconClass = '📚'
      bgClass = 'bg-purple-100 text-purple-700'
      label = 'Learning'
      break
    default:
      iconClass = '📝'
      bgClass = 'bg-gray-100 text-gray-700'
      label = 'Other'
  }

  return (
    <span className={`rounded-full ${bgClass} px-2 py-0.5 text-xs`}>
      <span className="mr-1">{iconClass}</span>
      {label}
    </span>
  )
}

// Helper function to format content with highlighted hashtags
const formatContentWithHashtags = (content: string) => {
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
          className="rounded-full bg-yellow-100 px-1.5 py-0.5 text-yellow-700"
        >
          {part}
        </span>
      )
    }
    // Otherwise render as regular text
    return <React.Fragment key={index}>{part}</React.Fragment>
  })
}

export const JournalEntryList = () => {
  const router = useRouter()
  const [entryType, setEntryType] = useState<JournalEntryType | undefined>(
    undefined,
  )
  const [selectedWorkstream, setSelectedWorkstream] = useState<
    string | undefined
  >(undefined)
  const [isCareerRelated, setIsCareerRelated] = useState<boolean | undefined>(
    undefined,
  )
  const [cursor, setCursor] = useState<number | undefined>(undefined)

  // Get user workstreams for filter dropdown
  const { data: workstreams = [] } = api.journal.getUserWorkstreams.useQuery()

  // Get journal entries with filters
  const { data, isLoading, refetch } = api.journal.getUserEntries.useQuery({
    limit: 10,
    cursor,
    entryType,
    isCareerRelated,
    workstream: selectedWorkstream,
  })

  // Delete journal entry mutation
  const { mutate: deleteEntry } = api.journal.deleteEntry.useMutation({
    onSuccess: async () => {
      await refetch()
    },
  })

  // Handle delete entry
  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this journal entry?')) {
      deleteEntry({ id })
    }
  }

  // Reset all filters
  const resetFilters = () => {
    setEntryType(undefined)
    setSelectedWorkstream(undefined)
    setIsCareerRelated(undefined)
    setCursor(undefined)
  }

  // Format date to readable string
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <p className="text-center text-gray-500">Loading journal entries...</p>
    )
  }

  const entries = data?.entries || []
  const nextCursor = data?.nextCursor
  const totalCount = data?.totalCount || 0

  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
        <p className="mb-4 text-gray-500">No journal entries found.</p>
        <p className="text-sm text-gray-500">
          {Object.values({
            entryType,
            selectedWorkstream,
            isCareerRelated,
          }).some((v) => v !== undefined)
            ? 'Try adjusting your filters or create your first entry.'
            : 'Create your first entry to get started!'}
        </p>
        {Object.values({
          entryType,
          selectedWorkstream,
          isCareerRelated,
        }).some((v) => v !== undefined) && (
          <button
            onClick={resetFilters}
            className="mt-3 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Reset Filters
          </button>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Filter controls */}
      <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div>
            <label htmlFor="entryType" className="mr-2 text-sm font-medium">
              Type:
            </label>
            <select
              id="entryType"
              value={entryType || ''}
              onChange={(e) =>
                setEntryType((e.target.value as JournalEntryType) || undefined)
              }
              className="rounded border border-gray-300 px-2 py-1 text-sm"
            >
              <option value="">All</option>
              <option value="WIN">Win</option>
              <option value="PAIN_POINT">Pain Point</option>
              <option value="LEARNING">Learning</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="workstream" className="mr-2 text-sm font-medium">
              Workstream:
            </label>
            <select
              id="workstream"
              value={selectedWorkstream || ''}
              onChange={(e) =>
                setSelectedWorkstream(e.target.value || undefined)
              }
              className="rounded border border-gray-300 px-2 py-1 text-sm"
            >
              <option value="">All</option>
              {workstreams.map((workstream) => (
                <option key={workstream} value={workstream}>
                  {workstream}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">
              <input
                type="checkbox"
                checked={isCareerRelated === true}
                onChange={() =>
                  setIsCareerRelated(
                    isCareerRelated === true ? undefined : true,
                  )
                }
                className="mr-1"
              />
              Career Only
            </label>
          </div>

          <button
            onClick={resetFilters}
            className="ml-auto rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Entry count */}
      <div className="mb-4 text-sm text-gray-500">
        Showing {entries.length} of {totalCount} entries
      </div>

      {/* Entries list */}
      <div className="space-y-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-gray-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <EntryTypeIcon type={entry.entryType} />

                  {entry.isCareerRelated ? (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                      💼 Career
                    </span>
                  ) : (
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                      🏡 Personal
                    </span>
                  )}

                  <span className="text-xs text-gray-500">
                    {formatDate(entry.createdAt)}
                  </span>
                </div>

                {/* Entry content with highlighted hashtags */}
                <p className="mt-2 whitespace-pre-wrap text-gray-800">
                  {formatContentWithHashtags(entry.content)}
                </p>

                {/* Workstream chips */}
                <WorkstreamChips workstreams={entry.workstreams} />
              </div>

              {/* Delete button */}
              <button
                onClick={() => handleDelete(entry.id)}
                className="ml-4 text-red-500 hover:text-red-700"
                aria-label="Delete entry"
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
        ))}
      </div>

      {/* Pagination */}
      {nextCursor && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setCursor(nextCursor)}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  )
}

export default JournalEntryList

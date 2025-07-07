'use client'

import { useEffect, useState } from 'react'
import { api } from '~/trpc/react'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import type { JournalEntryType } from '@prisma/client'
import Image from 'next/image'

// Use a type that matches the API's expected values
type AllowedEntryType = 'WIN' | 'PAIN_POINT' | 'LEARNING' | 'OTHER'

// Component to display entry type icon
const EntryTypeIcon: React.FC<{ type: JournalEntryType }> = ({ type }) => {
  let iconClass = ''
  let bgClass = ''
  let label = ''

  switch (type) {
    case 'WIN':
      iconClass = '🏆'
      bgClass =
        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      label = 'Win'
      break
    case 'PAIN_POINT':
      iconClass = '😓'
      bgClass = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      label = 'Pain Point'
      break
    case 'LEARNING':
      iconClass = '📚'
      bgClass =
        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      label = 'Learning'
      break
    default:
      iconClass = '📝'
      bgClass = 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
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
          className="rounded-full bg-yellow-100 px-1.5 py-0.5 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
        >
          {part}
        </span>
      )
    }
    // Otherwise render as regular text
    return <span key={index}>{part}</span>
  })
}

// Format date helper
function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

interface PublicJournalEntryProps {
  entry: {
    id: number
    content: string
    entryType: JournalEntryType
    isCareerRelated: boolean
    createdAt: Date
    user: {
      id: number
      name: string
      profilePicture: string
      uuid: string
    }
    happiness?: number | null
  }
}

const PublicJournalEntry: React.FC<PublicJournalEntryProps> = ({ entry }) => {
  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* User info and entry metadata */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-3 h-10 w-10 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            {entry.user.profilePicture ? (
              <Image
                src={entry.user.profilePicture}
                alt={entry.user.name}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-blue-100 text-blue-500 dark:bg-blue-900 dark:text-blue-300">
                {entry.user.name.substring(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <Link
              href={`/community/profile/${entry.user.uuid}`}
              className="font-medium text-gray-900 hover:underline dark:text-white"
            >
              {entry.user.name}
            </Link>
            <div className="flex space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <span>{formatDate(entry.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <EntryTypeIcon type={entry.entryType} />
          {entry.happiness && (
            <span className="flex items-center text-sm text-amber-500">
              <Heart className="mr-1 inline-block size-4" />
              {entry.happiness}/10
            </span>
          )}
        </div>
      </div>

      {/* Entry content */}
      <div className="mt-2 whitespace-pre-wrap text-gray-800 dark:text-gray-200">
        {formatContentWithHashtags(entry.content)}
      </div>
    </div>
  )
}

export default function PublicJournalFeed() {
  const [cursor, setCursor] = useState<number | undefined>(undefined)
  const [allEntries, setAllEntries] = useState<PublicJournalEntryProps['entry'][]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Get public journal entries with pagination
  const { data, isLoading, refetch } = api.journal.getPublicEntries.useQuery(
    {
      limit: 10,
      cursor,
    },
    {
      // This prevents multiple unnecessary requests
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
    },
  )

  // Load more entries when the user scrolls to the bottom
  const loadMore = async () => {
    if (!data?.nextCursor || isLoadingMore) return
    
    setIsLoadingMore(true)
    setCursor(data.nextCursor)
    
    try {
      const result = await refetch()
      
      if (result.data) {
        if (result.data.entries.length === 0) {
          setHasMore(false)
        }
      }
    } catch (error) {
      console.error('Error loading more entries:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Update the allEntries state when data changes
  useEffect(() => {
    if (data?.entries) {
      if (cursor) {
        setAllEntries((prev) => [...prev, ...data.entries])
      } else {
        setAllEntries(data.entries)
      }
      
      // Check if there are more entries to load
      setHasMore(!!data.nextCursor)
    }
  }, [data, cursor])

  if (isLoading && allEntries.length === 0) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  if (allEntries.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-2 text-lg font-semibold">No public entries yet</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Be the first to share your career journey with the community!
        </p>
        <Link
          href="/journal"
          className="mt-4 inline-block rounded bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600"
        >
          Create a Journal Entry
        </Link>
      </div>
    )
  }

  return (
    <div>
      {allEntries.map((entry) => (
        <PublicJournalEntry key={entry.id} entry={entry} />
      ))}

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="rounded-md bg-blue-50 px-4 py-2 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-800/30"
          >
            {isLoadingMore ? 'Loading...' : 'Load More Entries'}
          </button>
        </div>
      )}
    </div>
  )
}

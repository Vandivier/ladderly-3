'use client'

import React from 'react'
import { JournalEntryType } from '@prisma/client'
import { formatContentWithHashtags } from './JournalEntryList'

// Component to display entry type icon
export const EntryTypeIcon: React.FC<{ type: JournalEntryType }> = ({
  type,
}) => {
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

interface JournalEntryCardProps {
  entry: {
    id: number
    content: string
    entryType: JournalEntryType
    isCareerRelated: boolean
    isPublic: boolean
    createdAt: Date
    user?: {
      name: string | null
      image: string | null
    }
  }
  formatDate: (date: Date) => string
  isPublicFeed?: boolean
}

export const JournalEntryCard: React.FC<JournalEntryCardProps> = ({
  entry,
  formatDate,
  isPublicFeed = false,
}) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600">
      <div className="flex items-start">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* User info for public feed */}
            {isPublicFeed && entry.user && (
              <>
                {entry.user.image ? (
                  <img
                    src={entry.user.image}
                    alt={entry.user.name || 'User'}
                    className="h-6 w-6 rounded-full"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-gray-300"></div>
                )}
                <span className="font-medium">
                  {entry.user.name || 'Anonymous'}
                </span>
              </>
            )}

            <EntryTypeIcon type={entry.entryType} />

            {entry.isCareerRelated ? (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                💼 Career
              </span>
            ) : (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                🏡 Personal
              </span>
            )}

            {entry.isPublic && (
              <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Public
              </span>
            )}

            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(entry.createdAt)}
            </span>
          </div>

          {/* Entry content */}
          <p className="mt-2 whitespace-pre-wrap text-gray-800 dark:text-gray-200">
            {formatContentWithHashtags(entry.content)}
          </p>
        </div>
      </div>
    </div>
  )
}

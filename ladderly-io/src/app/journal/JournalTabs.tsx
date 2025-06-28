'use client'

import React, { useState } from 'react'
import JournalEntryList from './JournalEntryList'
import PublicJournalFeed from './PublicJournalFeed'

export const JournalTabs = () => {
  const [activeTab, setActiveTab] = useState<'personal' | 'public'>('personal')

  return (
    <div className="mt-6">
      <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
        <ul className="-mb-px flex flex-wrap text-center text-sm font-medium">
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('personal')}
              className={`inline-block rounded-t-lg p-4 ${
                activeTab === 'personal'
                  ? 'border-b-2 border-ladderly-violet-600 text-ladderly-violet-600 dark:border-ladderly-violet-500 dark:text-ladderly-violet-500'
                  : 'hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              My Journal
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('public')}
              className={`inline-block rounded-t-lg p-4 ${
                activeTab === 'public'
                  ? 'border-b-2 border-ladderly-violet-600 text-ladderly-violet-600 dark:border-ladderly-violet-500 dark:text-ladderly-violet-500'
                  : 'hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              Community Feed
            </button>
          </li>
        </ul>
      </div>

      <div>
        {activeTab === 'personal' ? (
          <JournalEntryList />
        ) : (
          <PublicJournalFeed />
        )}
      </div>
    </div>
  )
}

export default JournalTabs

'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Download } from 'lucide-react'
import type { JobSearch } from '@prisma/client'

interface JobSearchHeaderProps {
  jobSearch: JobSearch
  onEditClick: () => void
  handleDownloadRoundLevelCsv: () => Promise<void>
}

export const JobSearchHeader: React.FC<JobSearchHeaderProps> = ({
  jobSearch,
  onEditClick,
  handleDownloadRoundLevelCsv,
}) => {
  return (
    <div>
      <div className="mb-2">
        <Link
          href="/job-search"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Archive
        </Link>
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{jobSearch.name}</h2>
          <div className="mt-2 text-sm text-gray-500">
            {jobSearch.isActive ? (
              <span className="inline-flex items-center">
                <span className="mr-1 h-2 w-2 rounded-full bg-green-500"></span>
                Active
              </span>
            ) : (
              <span className="inline-flex items-center">
                <span className="mr-1 h-2 w-2 rounded-full bg-gray-500"></span>
                Inactive
              </span>
            )}
            <span className="mx-2">·</span>
            <span>
              Created {new Date(jobSearch.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="mt-4 flex space-x-2">
          <Link
            href={`/job-search/${jobSearch.id}/graphs`}
            className="rounded bg-blue-50 px-3 py-1 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-800/30"
          >
            View Analytics
          </Link>
          <button
            onClick={handleDownloadRoundLevelCsv}
            className="flex items-center gap-1 rounded bg-green-50 px-3 py-1 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-800/30"
          >
            <Download className="h-4 w-4" /> CSV
          </button>
          <button
            onClick={onEditClick}
            className="rounded px-3 py-1 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  )
}

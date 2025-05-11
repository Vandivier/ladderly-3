'use client'

import React from 'react'
import { Heart, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { api } from '~/trpc/react'

// Client component for the happiness chart
export default function HappinessChart() {
  // Fetch journal entries for the past year
  const oneYearAgo = React.useMemo(() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() - 1)
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const { data, isLoading, error } = api.journal.getUserEntries.useQuery({
    fromDate: oneYearAgo,
    limit: 365,
  })

  // Filter entries with happiness values and format dates consistently
  const happinessEntries = React.useMemo(() => {
    if (!data?.entries) return []

    // Create a map to collect all entries for each day
    const entriesByDate = new Map()

    data.entries
      // Make sure we capture any entry with a non-null, non-undefined happiness value
      .filter((e) => e.happiness !== null && e.happiness !== undefined)
      .forEach((entry) => {
        // Create date object from entry timestamp
        const date = new Date(entry.createdAt)

        // Use local date components to create consistent keys (ignoring timezone)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0') // +1 because months are 0-indexed
        const day = String(date.getDate()).padStart(2, '0')

        // This ensures entries from the same calendar day are grouped together
        const dateKey = `${year}-${month}-${day}`

        // If we don't have this date yet, create an array for it
        if (!entriesByDate.has(dateKey)) {
          entriesByDate.set(dateKey, [])
        }

        // Add this entry to the day's collection
        entriesByDate.get(dateKey).push(entry)
      })

    // Convert map to array sorted by date
    return Array.from(entriesByDate.entries())
      .map(([dateKey, entries]) => {
        // Calculate average happiness for this day
        const entriesArray = entries as Array<any> // Type assertion for the array
        const sum = entriesArray.reduce(
          (total, e: any) => total + e.happiness,
          0,
        )
        const averageHappiness =
          Math.round((sum / entriesArray.length) * 10) / 10

        // Format the date for display
        const [year, month, day] = dateKey
          .split('-')
          .map((num: string) => parseInt(num, 10))
        const date = new Date(year, month - 1, day) // month is 0-indexed in Date constructor

        // Format date for display
        const formattedDate = date.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        })

        const entryCount = entriesArray.length

        return {
          dateKey, // Keep raw date for sorting
          date: formattedDate,
          happiness: averageHappiness,
          count: entryCount, // Store count for tooltip
        }
      })
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
  }, [data])

  // Calculate average happiness if there's data
  const averageHappiness = React.useMemo(() => {
    if (happinessEntries.length === 0) return 0
    const sum = happinessEntries.reduce(
      (total, entry) => total + entry.happiness,
      0,
    )
    return Math.round((sum / happinessEntries.length) * 10) / 10 // Round to 1 decimal
  }, [happinessEntries])

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="mb-4 flex items-center gap-2">
        <Link
          href="/journal"
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to Journal
        </Link>
        <span className="flex items-center gap-1 text-lg font-semibold text-purple-700 dark:text-purple-300">
          <Heart className="size-5 text-pink-500" />
          <BarChart3 className="size-5" />
          Happiness Over Time
        </span>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xl font-bold">Your Happiness (Past Year)</h2>
          {happinessEntries.length > 0 && (
            <div className="rounded-md bg-purple-100 px-2 py-1 text-sm font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
              Avg: {averageHappiness}/10
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            {error.message || 'Failed to load data'}
          </div>
        ) : happinessEntries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No happiness data found in your journal entries.
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={happinessEntries}
                margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" minTickGap={30} tick={{ fontSize: 12 }} />
                <YAxis
                  domain={[1, 10]}
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value, name, props) => {
                    const entry = props.payload
                    return [
                      `${value}/10 (${entry.count} ${entry.count === 1 ? 'entry' : 'entries'})`,
                      'Avg Happiness',
                    ]
                  }}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="happiness"
                  stroke="#e11d48"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Entry count */}
            <div className="mt-4 text-center text-sm text-gray-500">
              Data from {happinessEntries.length}{' '}
              {happinessEntries.length === 1 ? 'day' : 'days'} of journal
              entries with happiness values
            </div>
          </>
        )}
      </div>
    </div>
  )
}

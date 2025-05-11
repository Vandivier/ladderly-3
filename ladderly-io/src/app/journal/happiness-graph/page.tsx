'use client'

import React from 'react'
import { api } from '~/trpc/react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Heart, BarChart3 } from 'lucide-react'

export default function HappinessGraphPage() {
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

  // Filter entries with happiness values
  const happinessEntries = React.useMemo(() => {
    if (!data?.entries) return []
    return data.entries
      .filter((e) => typeof e.happiness === 'number')
      .map((e) => ({
        date: new Date(e.createdAt).toLocaleDateString(),
        happiness: e.happiness,
      }))
  }, [data])

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
        <h2 className="mb-2 text-xl font-bold">Your Happiness (Past Year)</h2>
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
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={happinessEntries}
              margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" minTickGap={30} />
              <YAxis domain={[1, 10]} allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="happiness"
                stroke="#e11d48"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { JobPostForCandidate } from '@prisma/client'
import {
  getApplicationDate,
  getWeekStart,
  formatDateLabel,
  safeMapGet,
  safeMapSet,
} from './graphUtils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

// Time period options for the graph
const TIME_PERIODS = {
  '1M': 30,
  '3M': 90,
  '6M': 180,
  ALL: 0,
}

type TimePeriod = keyof typeof TIME_PERIODS

export function WeeklyApplicationsGraph({
  jobPosts,
}: {
  jobPosts: JobPostForCandidate[]
}) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('ALL')
  const [chartData, setChartData] = useState<
    Array<{ date: string; count: number; formattedDate: string }>
  >([])
  const [dataError, setDataError] = useState<string | null>(null)

  // Process data whenever jobPosts or timePeriod changes
  useEffect(() => {
    console.log('Processing weekly application data. Posts:', jobPosts?.length)
    const newData = processData()

    setChartData(newData)
    setDataError(newData.length === 0 ? 'No application data to display' : null)
  }, [jobPosts, timePeriod])

  // Process data
  const processData = () => {
    try {
      // Safety check - early return an empty array if no posts
      if (!jobPosts || jobPosts.length === 0) {
        console.log('No job posts found to process')
        return []
      }

      console.log('Found job posts:', jobPosts.length)

      // Map to store application counts by week
      const weeklyAppCounts = new Map<string, number>()
      let validDates = 0

      // Process each job post to count applications by week
      jobPosts.forEach((post, index) => {
        // Get application date from the post
        const appDate = getApplicationDate(post)

        if (!appDate) {
          if (index < 5)
            console.log(`No valid date for post ${post.id} (${post.company})`)
          return
        }

        validDates++

        // Get the start of the week for this application date
        const weekStart = getWeekStart(appDate)
        const weekKey = weekStart.toISOString().split('T')[0]

        // Increment the count for this week
        const currentCount = safeMapGet(weeklyAppCounts, weekKey, 0) || 0
        safeMapSet(weeklyAppCounts, weekKey, currentCount + 1)
      })

      console.log(`Processed ${validDates} posts with valid dates`)

      // Convert to array format
      let filteredData: [string, number][] = Array.from(
        weeklyAppCounts.entries(),
      )

      // Debug check
      if (filteredData.length === 0) {
        console.log('No weekly data found after processing')
        return []
      }

      console.log(`Found ${filteredData.length} unique weeks with data`)

      // Filter data based on selected time period
      if (TIME_PERIODS[timePeriod] > 0) {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - TIME_PERIODS[timePeriod])

        const originalLength = filteredData.length
        filteredData = filteredData.filter(([weekKey]) => {
          return new Date(weekKey) >= cutoffDate
        })

        console.log(
          `Filtered from ${originalLength} to ${filteredData.length} weeks based on period ${timePeriod}`,
        )
      }

      // Sort by date (ascending)
      filteredData.sort(
        (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime(),
      )

      // Format for Recharts
      const formattedChartData = filteredData.map(([date, count]) => ({
        date,
        count,
        formattedDate: formatDateLabel(date),
      }))

      console.log('Final chart data:', formattedChartData.length, 'weeks')
      return formattedChartData
    } catch (error) {
      console.error('Error processing weekly application data:', error)
      setDataError('Error processing data')
      return []
    }
  }

  // If no data to display
  if (!chartData || chartData.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-semibold">Weekly Applications</h2>
        <div className="flex h-64 flex-col items-center justify-center">
          <p className="text-gray-500">
            {dataError ||
              'No application data available for the selected period.'}
          </p>
          <p className="mt-2 text-sm text-gray-400">
            {jobPosts?.length
              ? `Found ${jobPosts.length} job posts, but none have valid dates.`
              : 'No job posts found.'}
          </p>
        </div>
      </div>
    )
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-md bg-gray-900 p-2 text-sm text-white shadow-lg">
          <p className="font-medium">{data.formattedDate}</p>
          <p>
            {data.count} application{data.count !== 1 ? 's' : ''}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="rounded-lg border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Weekly Applications</h2>

        {/* Time period selector */}
        <div className="flex space-x-1 rounded-md bg-gray-100 p-1 dark:bg-gray-800">
          {Object.keys(TIME_PERIODS).map((period) => (
            <button
              key={period}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                timePeriod === period
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400'
                  : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
              onClick={() => setTimePeriod(period as TimePeriod)}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Recharts Bar Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 10, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="formattedDate"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
              tickMargin={10}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              allowDecimals={false}
              // Only show integer ticks
              tickFormatter={(value) => String(Math.floor(value))}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: 10 }} />
            <Bar
              name="Applications"
              dataKey="count"
              fill="#60a5fa"
              radius={[4, 4, 0, 0]}
              animationDuration={500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

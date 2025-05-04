'use client'

import React, { useState } from 'react'
import { JobPostForCandidate } from '@prisma/client'
import {
  getApplicationDate,
  getWeekStart,
  formatDateLabel,
  safeMapGet,
  safeMapSet,
} from './graphUtils'

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
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('3M')
  const [hoveredWeek, setHoveredWeek] = useState<string | null>(null)

  // Process data
  const processData = () => {
    try {
      // Map to store application counts by week
      const weeklyAppCounts = new Map<string, number>()

      // Process each job post to count applications by week
      jobPosts.forEach((post) => {
        // Get application date from the post
        const appDate = getApplicationDate(post)
        if (!appDate) return

        // Get the start of the week for this application date
        const weekStart = getWeekStart(appDate)
        const weekKey = weekStart.toISOString().split('T')[0]

        // Increment the count for this week
        const currentCount = safeMapGet(weeklyAppCounts, weekKey, 0) || 0
        safeMapSet(weeklyAppCounts, weekKey, currentCount + 1)
      })

      // Filter data based on selected time period
      let filteredData: [string, number][] = Array.from(
        weeklyAppCounts.entries(),
      )

      if (TIME_PERIODS[timePeriod] > 0) {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - TIME_PERIODS[timePeriod])
        filteredData = filteredData.filter(([weekKey]) => {
          return new Date(weekKey) >= cutoffDate
        })
      }

      // Sort by date (ascending)
      filteredData.sort(
        (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime(),
      )

      return filteredData
    } catch (error) {
      console.error('Error processing weekly application data:', error)
      return []
    }
  }

  const weeklyData = processData()

  // If no data to display
  if (!weeklyData.length) {
    return (
      <div className="rounded-lg border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-semibold">Weekly Applications</h2>
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-500">
            No application data available for the selected period.
          </p>
        </div>
      </div>
    )
  }

  // SVG chart dimensions
  const padding = { top: 20, right: 20, bottom: 30, left: 40 }
  const width = 600
  const height = 300
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Find the maximum application count
  const maxCount = Math.max(...weeklyData.map(([_, count]) => count))
  const yScale = maxCount > 0 ? chartHeight / maxCount : 0
  const barWidth = chartWidth / (weeklyData.length || 1) - 4 // 4px gap between bars

  // Render y-axis tick marks and labels
  const yAxisTicks = []
  const tickCount = 5
  for (let i = 0; i <= tickCount; i++) {
    const y = chartHeight - i * (chartHeight / tickCount)
    const value = Math.round(i * (maxCount / tickCount))
    yAxisTicks.push(
      <g key={`y-tick-${i}`}>
        <line
          x1={padding.left - 5}
          y1={padding.top + y}
          x2={padding.left}
          y2={padding.top + y}
          stroke="#cbd5e1"
        />
        <text
          x={padding.left - 10}
          y={padding.top + y + 5}
          fontSize="10"
          textAnchor="end"
          fill="#64748b"
        >
          {value}
        </text>
        {/* Horizontal grid lines */}
        <line
          x1={padding.left}
          y1={padding.top + y}
          x2={width - padding.right}
          y2={padding.top + y}
          stroke="#cbd5e1"
          strokeWidth="0.5"
          strokeDasharray="4"
        />
      </g>,
    )
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

      {/* SVG chart */}
      <svg width={width} height={height} className="overflow-visible">
        {/* Y-axis */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + chartHeight}
          stroke="#cbd5e1"
          strokeWidth="1"
        />

        {/* X-axis */}
        <line
          x1={padding.left}
          y1={padding.top + chartHeight}
          x2={width - padding.right}
          y2={padding.top + chartHeight}
          stroke="#cbd5e1"
          strokeWidth="1"
        />

        {/* Y-axis ticks */}
        {yAxisTicks}

        {/* Bars with tooltips */}
        {weeklyData.map(([week, count], index) => {
          const barHeight = count * yScale
          const x = padding.left + index * (barWidth + 4) // 4px gap
          const y = padding.top + chartHeight - barHeight

          // Format the week label
          const weekDate = new Date(week)
          const formattedDateStr = formatDateLabel(weekDate)

          return (
            <g key={week}>
              {/* X-axis label (week) */}
              {index % Math.ceil(weeklyData.length / 8) === 0 && (
                <text
                  x={x + barWidth / 2}
                  y={padding.top + chartHeight + 20}
                  fontSize="10"
                  textAnchor="middle"
                  fill="#64748b"
                >
                  {formattedDateStr}
                </text>
              )}

              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={hoveredWeek === week ? '#3b82f6' : '#60a5fa'}
                rx="2"
                onMouseEnter={() => setHoveredWeek(week)}
                onMouseLeave={() => setHoveredWeek(null)}
              />

              {/* Tooltip */}
              {hoveredWeek === week && (
                <g>
                  <rect
                    x={x + barWidth / 2 - 50}
                    y={y - 30}
                    width="100"
                    height="26"
                    rx="3"
                    fill="#1e293b"
                  />
                  <text
                    x={x + barWidth / 2}
                    y={y - 14}
                    fontSize="12"
                    textAnchor="middle"
                    fill="white"
                  >
                    {`${formattedDateStr}: ${count} app${count !== 1 ? 's' : ''}`}
                  </text>
                </g>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import {
  JobPostForCandidate,
  JobSearchStep,
  JobSearchStepKind,
} from '@prisma/client'
import {
  formatPercent,
  TIME_PERIODS,
  type TimePeriod,
  getApplicationDate,
} from './graphUtils'
import { TimePeriodSelector } from './TimePeriodSelector'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts'

// Define round type display names for nicer labels
const ROUND_TYPE_DISPLAY_NAMES: Record<JobSearchStepKind, string> = {
  BACKGROUND_OR_REFERENCE_CHECK: 'Background Check',
  BEHAVIORAL_INTERVIEW: 'Behavioral',
  HIRING_MANAGER_CALL: 'Hiring Manager',
  INITIAL_APPLICATION: 'Initial Application',
  MULTI_ROUND_MULTI_KIND: 'Multi-Round Loop',
  NONTECHNICAL_CONVERSATION: 'Non-Technical',
  OTHER: 'Other',
  OUTBOUND_MESSAGE: 'Outbound Message',
  PHONE_SCREEN: 'Phone Screen',
  SYSTEM_DESIGN: 'System Design',
  TAKE_HOME_ASSIGNMENT: 'Take Home',
  TECHNICAL_CODE_SCREEN_AUTOMATED: 'Automated Code Screen',
  TECHNICAL_CODE_SCREEN_MANUAL: 'Manual Code Screen',
  TECHNICAL_CONVERSATION: 'Technical Discussion',
  TECHNICAL_OTHER: 'Technical (Other)',
}

// Group interview steps into larger categories for better visualization
const ROUND_CATEGORIES: Record<string, JobSearchStepKind[]> = {
  Technical: [
    JobSearchStepKind.TECHNICAL_CODE_SCREEN_AUTOMATED,
    JobSearchStepKind.TECHNICAL_CODE_SCREEN_MANUAL,
    JobSearchStepKind.TECHNICAL_CONVERSATION,
    JobSearchStepKind.TECHNICAL_OTHER,
    JobSearchStepKind.SYSTEM_DESIGN,
  ],
  'Non-Technical': [
    JobSearchStepKind.BEHAVIORAL_INTERVIEW,
    JobSearchStepKind.NONTECHNICAL_CONVERSATION,
    JobSearchStepKind.HIRING_MANAGER_CALL,
  ],
  'Initial Stages': [
    JobSearchStepKind.INITIAL_APPLICATION,
    JobSearchStepKind.OUTBOUND_MESSAGE,
    JobSearchStepKind.PHONE_SCREEN,
  ],
  'Advanced Stages': [
    JobSearchStepKind.TAKE_HOME_ASSIGNMENT,
    JobSearchStepKind.MULTI_ROUND_MULTI_KIND,
    JobSearchStepKind.BACKGROUND_OR_REFERENCE_CHECK,
  ],
  Other: [JobSearchStepKind.OTHER],
}

// Round success colors
const SUCCESS_COLORS = {
  passed: '#4ade80', // green
  failed: '#f87171', // red
  pending: '#60a5fa', // blue
}

type RoundType = {
  kind: JobSearchStepKind
  total: number
  passed: number
  failed: number
  pending: number
  successRate: number
  formattedRate: string
}

type ChartDataPoint = {
  name: string
  kind: JobSearchStepKind
  successRate: number
  total: number
  passed: number
  failed: number
  pending: number
  formattedRate: string
  category: string
}

type RoundPerformanceGraphProps = {
  jobPosts: JobPostForCandidate[] & {
    jobSearchSteps?: JobSearchStep[]
  }
}

export function RoundPerformanceGraph({
  jobPosts,
}: RoundPerformanceGraphProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('ALL')
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [dataError, setDataError] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Check for dark mode
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setIsDarkMode(isDark)

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'))
        }
      })
    })

    observer.observe(document.documentElement, { attributes: true })
    return () => observer.disconnect()
  }, [])

  // Process data when posts or time period changes
  useEffect(() => {
    console.log(
      'Processing round performance data. Posts:',
      jobPosts?.length,
      'Time Period:',
      timePeriod,
    )
    try {
      const processedData = processData()

      // Format data for the chart
      const formattedData = processedData
        .filter((round) => round.total > 0) // Only include rounds that have data
        .map((round) => ({
          name: ROUND_TYPE_DISPLAY_NAMES[round.kind],
          kind: round.kind,
          successRate: round.successRate,
          total: round.total,
          passed: round.passed,
          failed: round.failed,
          pending: round.pending,
          formattedRate: formatPercent(round.successRate),
          // Determine which category this round type belongs to
          category:
            Object.entries(ROUND_CATEGORIES).find(([_, types]) =>
              types.includes(round.kind),
            )?.[0] || 'Other',
        }))
        // Sort by success rate (higher first)
        .sort((a, b) => b.successRate - a.successRate)

      setChartData(formattedData)
      setDataError(
        formattedData.length === 0 ? 'No interview round data found' : null,
      )
    } catch (error) {
      console.error('Error processing round performance data:', error)
      setDataError('Error processing round data')
      setChartData([])
    }
  }, [jobPosts, timePeriod])

  // Process the data
  const processData = (): RoundType[] => {
    try {
      if (!jobPosts || !jobPosts.length) {
        console.log('No job posts found for round analysis')
        return []
      }

      // Filter job posts based on time period if needed
      let filteredPosts = jobPosts
      if (TIME_PERIODS[timePeriod] > 0) {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - TIME_PERIODS[timePeriod])

        const originalLength = filteredPosts.length
        filteredPosts = filteredPosts.filter((post) => {
          const appDate = getApplicationDate(post)
          return appDate && appDate >= cutoffDate
        })

        console.log(
          `Filtered from ${originalLength} to ${filteredPosts.length} posts based on period ${timePeriod}`,
        )
      }

      // If no posts after filtering, return empty array
      if (filteredPosts.length === 0) {
        console.log('No posts remaining after time period filtering')
        return []
      }

      // Create a map to track performance for each interview round type
      const roundTypeMap = new Map<
        JobSearchStepKind,
        {
          total: number
          passed: number
          failed: number
          pending: number
        }
      >()

      // Initialize the map with all round types
      Object.values(JobSearchStepKind).forEach((kind) => {
        roundTypeMap.set(kind, { total: 0, passed: 0, failed: 0, pending: 0 })
      })

      // Process all job search steps
      let processedSteps = 0
      filteredPosts.forEach((post) => {
        const steps = (post as any).jobSearchSteps
        if (!steps || steps.length === 0) {
          return
        }

        steps.forEach((step: JobSearchStep) => {
          processedSteps++

          // Get current data for this step kind
          const statsForKind = roundTypeMap.get(step.kind) || {
            total: 0,
            passed: 0,
            failed: 0,
            pending: 0,
          }

          // Increment counters
          statsForKind.total += 1

          if (step.isPassed === true) {
            statsForKind.passed += 1
          } else if (step.isPassed === false) {
            statsForKind.failed += 1
          } else {
            statsForKind.pending += 1
          }

          // Update the map
          roundTypeMap.set(step.kind, statsForKind)
        })
      })

      console.log(
        `Processed ${processedSteps} steps from ${filteredPosts.length} job posts`,
      )

      // If no steps were processed, show a more helpful message
      if (processedSteps === 0) {
        console.log('No interview steps found in the job posts')
        return []
      }

      // Convert map to array and calculate success rates
      const roundPerformance: RoundType[] = Array.from(
        roundTypeMap.entries(),
      ).map(([kind, stats]) => {
        // Calculate success rate (passed / (passed + failed))
        // Ignoring pending for the percentage calculation
        const decidedCount = stats.passed + stats.failed
        const successRate = decidedCount > 0 ? stats.passed / decidedCount : 0

        return {
          kind,
          total: stats.total,
          passed: stats.passed,
          failed: stats.failed,
          pending: stats.pending,
          successRate,
          formattedRate: formatPercent(successRate),
        }
      })

      return roundPerformance
    } catch (error) {
      console.error('Error processing round performance data:', error)
      return []
    }
  }

  // If no data to display
  if (!chartData || chartData.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-2 flex flex-col space-y-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <h2 className="text-xl font-semibold">Interview Round Performance</h2>
          <TimePeriodSelector
            selectedPeriod={timePeriod}
            onChange={setTimePeriod}
          />
        </div>
        <div className="flex h-64 flex-col items-center justify-center">
          <p className="text-gray-500">
            {dataError || 'No interview round data available.'}
          </p>
          {jobPosts?.length > 0 && (
            <p className="mt-2 text-sm text-gray-400">
              Record interview stages for your applications to see performance
              analytics.
            </p>
          )}
        </div>
      </div>
    )
  }

  // Colors based on theme
  const axisColor = isDarkMode ? '#94a3b8' : '#cbd5e1'
  const textColor = isDarkMode ? '#e2e8f0' : '#334155'
  const gridColor = isDarkMode ? '#475569' : '#e2e8f0'

  // Get the unique categories from the data
  const categories = Array.from(new Set(chartData.map((d) => d.category)))

  // Custom tooltip to show more detailed information
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const successPercent = formatPercent(data.passed / (data.total || 1))
      const pendingCount = data.pending

      return (
        <div className="rounded-md bg-gray-900 p-3 text-sm text-white shadow-lg">
          <p className="mb-1 font-medium">{data.name}</p>
          <p className="mb-1">Success rate: {data.formattedRate}</p>
          <div className="mt-2 border-t border-gray-700 pt-2">
            <p className="flex justify-between">
              <span>Passed:</span>
              <span className="ml-4 font-medium text-green-400">
                {data.passed}
              </span>
            </p>
            <p className="flex justify-between">
              <span>Failed:</span>
              <span className="ml-4 font-medium text-red-400">
                {data.failed}
              </span>
            </p>
            {pendingCount > 0 && (
              <p className="flex justify-between">
                <span>Pending:</span>
                <span className="ml-4 font-medium text-blue-400">
                  {pendingCount}
                </span>
              </p>
            )}
            <p className="mt-1 flex justify-between border-t border-gray-700 pt-1">
              <span>Total:</span>
              <span className="ml-4 font-medium">{data.total}</span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  // Handle category selection
  const handleCategoryClick = (category: string) => {
    if (activeCategory === category) {
      setActiveCategory(null) // Toggle off if already selected
    } else {
      setActiveCategory(category) // Set new active category
    }
  }

  // Filter data based on active category
  const displayData = activeCategory
    ? chartData.filter((item) => item.category === activeCategory)
    : chartData

  return (
    <div className="rounded-lg border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-2 flex flex-col space-y-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h2 className="text-xl font-semibold">Interview Round Performance</h2>
        <TimePeriodSelector
          selectedPeriod={timePeriod}
          onChange={setTimePeriod}
        />
      </div>

      <div>
        <p className="mb-2 text-sm text-gray-500">
          This chart shows your success rate for different interview round
          types.
        </p>

        {/* Category filters */}
        <div className="mb-3 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-blue-600 text-white dark:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={displayData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="name"
                tick={{ fill: textColor, fontSize: 12 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
                axisLine={{ stroke: axisColor }}
                tickLine={{ stroke: axisColor }}
              />
              <YAxis
                tickFormatter={(value) => formatPercent(value)}
                domain={[0, 1]}
                tick={{ fill: textColor, fontSize: 12 }}
                axisLine={{ stroke: axisColor }}
                tickLine={{ stroke: axisColor }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                onClick={(data) => {
                  const category = chartData.find(
                    (item) => item.name === data.dataKey,
                  )?.category
                  if (category) handleCategoryClick(category)
                }}
              />
              <Bar
                name="Success Rate"
                dataKey="successRate"
                radius={[4, 4, 0, 0]}
              >
                {displayData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.passed > entry.failed
                        ? SUCCESS_COLORS.passed
                        : SUCCESS_COLORS.failed
                    }
                    opacity={entry.pending > 0 ? 0.8 : 1} // Reduce opacity if there are pending interviews
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stats summary */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          <p>
            <span className="font-medium">Highest success:</span>{' '}
            {displayData[0]?.name || 'None'} -{' '}
            {displayData[0]?.formattedRate || '0%'} success rate
          </p>
        </div>
      </div>
    </div>
  )
}

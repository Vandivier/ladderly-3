'use client'

import React, { useState, useEffect } from 'react'
import { JobApplicationStatus, type JobPostForCandidate } from '@prisma/client'
import {
  formatPercent,
  type ResumeVersionData,
  getApplicationDate,
  TIME_PERIODS,
  type TimePeriod,
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
  LabelList,
} from 'recharts'

type ChartDataPoint = {
  name: string
  ratio: number
  formattedRatio: string
  countDisplay: string
}

export function ResumeEffectivenessGraph({
  jobPosts,
}: {
  jobPosts: JobPostForCandidate[]
}) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('ALL')
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [versionData, setVersionData] = useState<ResumeVersionData[]>([])
  const [dataError, setDataError] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Check for dark mode
  useEffect(() => {
    // Check if dark mode is enabled in the document
    const isDark = document.documentElement.classList.contains('dark')
    setIsDarkMode(isDark)

    // Create an observer to watch for class changes on document.documentElement
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark')
          setIsDarkMode(isDark)
        }
      })
    })

    // Start observing
    observer.observe(document.documentElement, { attributes: true })

    // Cleanup
    return () => observer.disconnect()
  }, [])

  // Process data when job posts or time period change
  useEffect(() => {
    console.log(
      'Processing resume effectiveness data. Posts:',
      jobPosts?.length,
      'Time Period:',
      timePeriod,
    )
    try {
      const processedData = processData()
      setVersionData(processedData)

      // Format data for Recharts
      const formattedData = processedData.map((data) => ({
        name: data.version,
        ratio: data.ratio,
        formattedRatio: data.formattedRatio ?? formatPercent(data.ratio),
        countDisplay:
          data.countDisplay ?? `(${data.interviews} of ${data.applications})`,
      }))

      setChartData(formattedData)
      setDataError(
        formattedData.length === 0 ? 'No resume version data found' : null,
      )
    } catch (error) {
      console.error('Error processing resume data:', error)
      setDataError('Error processing resume data')
      setChartData([])
      setVersionData([])
    }
  }, [jobPosts, timePeriod])

  // Process the data
  const processData = (): ResumeVersionData[] => {
    try {
      if (!jobPosts || !jobPosts.length) {
        console.log('No job posts found for resume analysis')
        return []
      }

      console.log(`Processing ${jobPosts.length} job posts for resume versions`)

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

      // Create a map to store data for each resume version
      const versionMap = new Map<
        string,
        {
          applications: number
          interviews: number
          offers: number
          rejections: number
        }
      >()

      // Process each job post
      filteredPosts.forEach((post) => {
        // Handle resume version (use "Unknown" as fallback)
        const version = post.resumeVersion ?? 'Unknown'

        // Get current data for this version or initialize
        const versionData = versionMap.get(version) ?? {
          applications: 0,
          interviews: 0,
          offers: 0,
          rejections: 0,
        }

        // Increment application count
        versionData.applications += 1

        // Update interview/offer/rejection counts based on status
        if (post.status === JobApplicationStatus.IN_INTERVIEW) {
          versionData.interviews += 1
        } else if (post.status === JobApplicationStatus.OFFER_RECEIVED) {
          versionData.interviews += 1
          versionData.offers += 1
        } else if (post.status === JobApplicationStatus.REJECTED) {
          versionData.rejections += 1
        }

        // Store updated data
        versionMap.set(version, versionData)
      })

      console.log(`Found ${versionMap.size} different resume versions`)

      // Convert map to array and calculate success ratios
      const processedVersions: ResumeVersionData[] = Array.from(
        versionMap.entries(),
      )
        .map(([version, data]) => {
          const interviewRatio =
            data.applications > 0 ? data.interviews / data.applications : 0

          return {
            version,
            applications: data.applications,
            interviews: data.interviews,
            offers: data.offers,
            rejections: data.rejections,
            ratio: interviewRatio,
            // Add formatted values for display
            formattedRatio: formatPercent(interviewRatio),
            countDisplay: `(${data.interviews} of ${data.applications})`,
          }
        })
        // Sort by effectiveness (higher ratios first)
        .sort((a, b) => b.ratio - a.ratio)

      return processedVersions
    } catch (error) {
      console.error('Error processing resume effectiveness data:', error)
      return []
    }
  }

  // If no data to display
  if (!chartData || chartData.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-2 flex flex-col space-y-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <h2 className="text-xl font-semibold">Resume Effectiveness</h2>
          <TimePeriodSelector
            selectedPeriod={timePeriod}
            onChange={setTimePeriod}
          />
        </div>
        <div className="flex h-64 flex-col items-center justify-center">
          <p className="text-gray-500">
            {dataError ?? 'No resume version data available.'}
          </p>
          {jobPosts?.length > 0 && (
            <p className="mt-2 text-sm text-gray-400">
              Try selecting a different time period such as {'"'}ALL{'"'}.
            </p>
          )}
        </div>
      </div>
    )
  }

  // Select colors for bars
  const barColors = ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8']

  // Colors based on theme
  const axisColor = isDarkMode ? '#94a3b8' : '#cbd5e1'
  const yAxisTextColor = isDarkMode ? '#f8fafc' : '#334155'
  const xAxisTextColor = isDarkMode ? '#cbd5e1' : '#64748b'
  const labelTextColor = isDarkMode ? '#e2e8f0' : '#374151'
  const sublabelTextColor = isDarkMode ? '#cbd5e1' : '#6b7280'

  // Custom tooltip to show more information
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-md bg-gray-900 p-2 text-sm text-white shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p>Success rate: {data.formattedRatio}</p>
          <p>Applications: {data.countDisplay}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="rounded-lg border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-2 flex flex-col space-y-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h2 className="text-xl font-semibold">Resume Effectiveness</h2>
        <TimePeriodSelector
          selectedPeriod={timePeriod}
          onChange={setTimePeriod}
        />
      </div>

      <div>
        <p className="mb-4 text-sm text-gray-500">
          This chart shows how effective each resume version is at getting
          interviews.
        </p>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
                stroke={axisColor}
              />
              <XAxis
                type="number"
                domain={[
                  0,
                  Math.max(
                    0.05,
                    Math.ceil(Math.max(...chartData.map((d) => d.ratio)) * 10) /
                      10,
                  ),
                ]}
                tickFormatter={(value) => formatPercent(value)}
                tick={{ fill: xAxisTextColor, fontSize: 12 }}
                axisLine={{ stroke: axisColor }}
                tickLine={{ stroke: axisColor }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fill: yAxisTextColor, fontSize: 13, fontWeight: 500 }}
                tickLine={{ stroke: axisColor }}
                axisLine={{ stroke: axisColor }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="ratio" minPointSize={3}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={barColors[index % barColors.length]}
                  />
                ))}
                <LabelList
                  dataKey="formattedRatio"
                  position="right"
                  style={{ fill: labelTextColor, fontWeight: 'bold' }}
                />
                <LabelList
                  dataKey="countDisplay"
                  position="right"
                  style={{ fill: sublabelTextColor, fontSize: 12 }}
                  offset={45}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          <p>
            <span className="font-medium">Most effective:</span>{' '}
            {versionData[0]?.version ?? 'None'} -{' '}
            {versionData[0]?.formattedRatio ?? '0%'} interview rate
          </p>
        </div>
      </div>
    </div>
  )
}

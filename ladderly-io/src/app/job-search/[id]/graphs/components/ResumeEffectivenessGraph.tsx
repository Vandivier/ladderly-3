'use client'

import React, { useState, useEffect } from 'react'
import { JobApplicationStatus, JobPostForCandidate } from '@prisma/client'
import { formatPercent, type ResumeVersionData } from './graphUtils'
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
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [versionData, setVersionData] = useState<ResumeVersionData[]>([])
  const [dataError, setDataError] = useState<string | null>(null)

  // Process data when job posts change
  useEffect(() => {
    console.log(
      'Processing resume effectiveness data. Posts:',
      jobPosts?.length,
    )
    try {
      const processedData = processData()
      setVersionData(processedData)

      // Format data for Recharts
      const formattedData = processedData.map((data) => ({
        name: data.version,
        ratio: data.ratio,
        formattedRatio: data.formattedRatio || formatPercent(data.ratio),
        countDisplay:
          data.countDisplay || `(${data.interviews} of ${data.applications})`,
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
  }, [jobPosts])

  // Process the data
  const processData = (): ResumeVersionData[] => {
    try {
      if (!jobPosts || !jobPosts.length) {
        console.log('No job posts found for resume analysis')
        return []
      }

      console.log(`Processing ${jobPosts.length} job posts for resume versions`)

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
      jobPosts.forEach((post) => {
        // Handle resume version (use "Unknown" as fallback)
        const version = post.resumeVersion || 'Unknown'

        // Get current data for this version or initialize
        const versionData = versionMap.get(version) || {
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
        <h2 className="mb-4 text-xl font-semibold">Resume Effectiveness</h2>
        <div className="flex h-64 flex-col items-center justify-center">
          <p className="text-gray-500">
            {dataError || 'No resume version data available.'}
          </p>
          {jobPosts?.length > 0 && (
            <p className="mt-2 text-sm text-gray-400">
              Found {jobPosts.length} job posts, but no resume version data to
              analyze.
            </p>
          )}
        </div>
      </div>
    )
  }

  // Select colors for bars
  const barColors = ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8']

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
      <h2 className="mb-4 text-xl font-semibold">Resume Effectiveness</h2>

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
              />
              <YAxis type="category" dataKey="name" width={100} />
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
                  style={{ fill: '#374151', fontWeight: 'bold' }}
                />
                <LabelList
                  dataKey="countDisplay"
                  position="right"
                  style={{ fill: '#6b7280', fontSize: 12 }}
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
            {versionData[0]?.version || 'None'} -{' '}
            {versionData[0]?.formattedRatio || '0%'} interview rate
          </p>
        </div>
      </div>
    </div>
  )
}

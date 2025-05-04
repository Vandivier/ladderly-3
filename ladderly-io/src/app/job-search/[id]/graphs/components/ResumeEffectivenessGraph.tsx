'use client'

import React, { useState } from 'react'
import { JobApplicationStatus, JobPostForCandidate } from '@prisma/client'
import { formatPercent, type ResumeVersionData } from './graphUtils'

export function ResumeEffectivenessGraph({
  jobPosts,
}: {
  jobPosts: JobPostForCandidate[]
}) {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)

  // Process the data
  const processData = (): ResumeVersionData[] => {
    try {
      if (!jobPosts.length) {
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
      jobPosts.forEach((post) => {
        // Skip posts without a resume version
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

      // Convert map to array and calculate success ratios
      const resumeVersions: ResumeVersionData[] = Array.from(
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
          }
        })
        // Sort by effectiveness (higher ratios first)
        .sort((a, b) => b.ratio - a.ratio)

      return resumeVersions
    } catch (error) {
      console.error('Error processing resume effectiveness data:', error)
      return []
    }
  }

  const resumeVersions = processData()

  // If no data to display
  if (!resumeVersions.length) {
    return (
      <div className="rounded-lg border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-semibold">Resume Effectiveness</h2>
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-500">No resume version data available.</p>
        </div>
      </div>
    )
  }

  // SVG chart dimensions
  const padding = { top: 20, right: 30, bottom: 30, left: 40 }
  const width = 600
  const height = 300
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Chart settings
  const barHeight = 40
  const barGap = 20
  const totalBarHeight = resumeVersions.length * (barHeight + barGap) - barGap

  // Calculate the maximum ratio for scaling
  const maxRatio = Math.max(...resumeVersions.map((v) => v.ratio), 0.1)

  return (
    <div className="rounded-lg border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="mb-4 text-xl font-semibold">Resume Effectiveness</h2>

      <div>
        <p className="mb-4 text-sm text-gray-500">
          This chart shows how effective each resume version is at getting
          interviews.
        </p>

        <svg
          width={width}
          height={Math.max(
            height,
            totalBarHeight + padding.top + padding.bottom,
          )}
          className="overflow-visible"
        >
          {/* X-axis */}
          <line
            x1={padding.left}
            y1={padding.top + totalBarHeight}
            x2={width - padding.right}
            y2={padding.top + totalBarHeight}
            stroke="#cbd5e1"
            strokeWidth="1"
          />

          {/* X-axis ticks */}
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
            const x = padding.left + (tick / maxRatio) * chartWidth
            return (
              <g key={`tick-${tick}`}>
                <line
                  x1={x}
                  y1={padding.top + totalBarHeight}
                  x2={x}
                  y2={padding.top + totalBarHeight + 5}
                  stroke="#cbd5e1"
                />
                <text
                  x={x}
                  y={padding.top + totalBarHeight + 20}
                  fontSize="12"
                  textAnchor="middle"
                  fill="#64748b"
                >
                  {formatPercent(tick)}
                </text>
              </g>
            )
          })}

          {/* Bars */}
          {resumeVersions.map((versionData, index) => {
            const y = padding.top + index * (barHeight + barGap)
            const barWidth = (versionData.ratio / maxRatio) * chartWidth
            const isSelected = selectedVersion === versionData.version

            return (
              <g
                key={versionData.version}
                onMouseEnter={() => setSelectedVersion(versionData.version)}
                onMouseLeave={() => setSelectedVersion(null)}
              >
                {/* Version label */}
                <text
                  x={padding.left - 10}
                  y={y + barHeight / 2}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontSize="14"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  fill="#64748b"
                >
                  {versionData.version}
                </text>

                {/* Bar background */}
                <rect
                  x={padding.left}
                  y={y}
                  width={chartWidth}
                  height={barHeight}
                  fill="#e2e8f0"
                  rx="4"
                />

                {/* Bar value */}
                <rect
                  x={padding.left}
                  y={y}
                  width={barWidth || 2} // Minimum 2px width for visibility
                  height={barHeight}
                  fill={isSelected ? '#3b82f6' : '#60a5fa'}
                  rx="4"
                />

                {/* Percentage text */}
                <text
                  x={padding.left + barWidth + 10}
                  y={y + barHeight / 2}
                  dominantBaseline="middle"
                  fontSize="14"
                  fontWeight="bold"
                  fill={isSelected ? '#3b82f6' : '#64748b'}
                >
                  {formatPercent(versionData.ratio)}
                </text>

                {/* Count text */}
                <text
                  x={padding.left + barWidth + 70}
                  y={y + barHeight / 2}
                  dominantBaseline="middle"
                  fontSize="12"
                  fill="#94a3b8"
                >
                  ({versionData.interviews} of {versionData.applications})
                </text>
              </g>
            )
          })}
        </svg>

        {/* Legend */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          <p>
            <span className="font-medium">Most effective:</span>{' '}
            {resumeVersions[0]?.version || 'None'} -
            {formatPercent(resumeVersions[0]?.ratio || 0)} interview rate
          </p>
        </div>
      </div>
    </div>
  )
}

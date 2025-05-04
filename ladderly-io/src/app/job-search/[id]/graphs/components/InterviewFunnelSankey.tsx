'use client'

import React, { useState, useEffect } from 'react'
import {
  JobPostForCandidate,
  JobSearchStep,
  JobSearchStepKind,
  JobApplicationStatus,
} from '@prisma/client'
import { Chart } from 'react-google-charts'
import { TIME_PERIODS, type TimePeriod, getApplicationDate } from './graphUtils'
import { TimePeriodSelector } from './TimePeriodSelector'

// Stage definitions for the Sankey diagram
const STAGES = {
  APPLIED: 'Applied',
  SCREEN: 'Screen',
  FIRST_ROUND: 'First Round',
  FINAL_ROUND: 'Final Round',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
}

// Mapping job search step kinds to our simplified stages
const STEP_KIND_TO_STAGE = {
  [JobSearchStepKind.INITIAL_APPLICATION]: STAGES.APPLIED,
  [JobSearchStepKind.PHONE_SCREEN]: STAGES.SCREEN,
  [JobSearchStepKind.TECHNICAL_CODE_SCREEN_AUTOMATED]: STAGES.SCREEN,
  [JobSearchStepKind.TECHNICAL_CODE_SCREEN_MANUAL]: STAGES.SCREEN,
  [JobSearchStepKind.BEHAVIORAL_INTERVIEW]: STAGES.FIRST_ROUND,
  [JobSearchStepKind.TECHNICAL_CONVERSATION]: STAGES.FIRST_ROUND,
  [JobSearchStepKind.TECHNICAL_OTHER]: STAGES.FIRST_ROUND,
  [JobSearchStepKind.SYSTEM_DESIGN]: STAGES.FIRST_ROUND,
  [JobSearchStepKind.HIRING_MANAGER_CALL]: STAGES.FIRST_ROUND,
  [JobSearchStepKind.NONTECHNICAL_CONVERSATION]: STAGES.FIRST_ROUND,
  [JobSearchStepKind.MULTI_ROUND_MULTI_KIND]: STAGES.FINAL_ROUND,
  [JobSearchStepKind.BACKGROUND_OR_REFERENCE_CHECK]: STAGES.FINAL_ROUND,
  [JobSearchStepKind.TAKE_HOME_ASSIGNMENT]: STAGES.FIRST_ROUND,
  [JobSearchStepKind.OUTBOUND_MESSAGE]: STAGES.APPLIED,
  [JobSearchStepKind.OTHER]: STAGES.FIRST_ROUND,
}

// Props type for the component
type InterviewFunnelSankeyProps = {
  jobPosts: JobPostForCandidate[] & {
    jobSearchSteps?: JobSearchStep[]
  }
}

export function InterviewFunnelSankey({
  jobPosts,
}: InterviewFunnelSankeyProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('ALL')
  const [chartData, setChartData] = useState<any[]>([])
  const [dataError, setDataError] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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
      'Processing interview funnel data. Posts:',
      jobPosts?.length,
      'Time Period:',
      timePeriod,
    )
    setIsLoading(true)

    try {
      const processedData = processData()
      setChartData(processedData)
      setDataError(
        processedData.length <= 1 ? 'No interview funnel data found' : null,
      )
    } catch (error) {
      console.error('Error processing interview funnel data:', error)
      setDataError('Error processing data')
      setChartData([])
    } finally {
      setIsLoading(false)
    }
  }, [jobPosts, timePeriod])

  // Process the data to generate Sankey diagram data
  const processData = (): any[] => {
    try {
      if (!jobPosts || !jobPosts.length) {
        console.log('No job posts found for funnel analysis')
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

      // Track the flow between stages
      const stageFlow = new Map<string, Map<string, number>>()

      // Initialize with all stages to ensure they appear in the Sankey
      const allStages = Object.values(STAGES)
      for (const fromStage of allStages) {
        stageFlow.set(fromStage, new Map<string, number>())
      }

      // Go through each job post and construct the journey
      filteredPosts.forEach((post) => {
        const steps = (post as any).jobSearchSteps || []

        // Sort steps by date to get the correct sequence
        const sortedSteps = [...steps].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        )

        // If no steps, track it based on application status
        if (sortedSteps.length === 0) {
          // Every post is at least "Applied"
          const fromStage = STAGES.APPLIED

          // Determine the destination based on application status
          let toStage
          if (post.status === JobApplicationStatus.OFFER_RECEIVED) {
            toStage = STAGES.OFFER
          } else if (post.status === JobApplicationStatus.REJECTED) {
            toStage = STAGES.REJECTED
          } else if (post.status === JobApplicationStatus.IN_INTERVIEW) {
            toStage = STAGES.FIRST_ROUND
          } else {
            toStage = STAGES.APPLIED // Apply to itself if no progression
          }

          // Update the flow
          if (fromStage !== toStage) {
            const fromMap = stageFlow.get(fromStage) || new Map()
            const currentCount = fromMap.get(toStage) || 0
            fromMap.set(toStage, currentCount + 1)
            stageFlow.set(fromStage, fromMap)
          }

          return
        }

        // Track the journey through each step
        let previousStage = STAGES.APPLIED

        for (let i = 0; i < sortedSteps.length; i++) {
          const step = sortedSteps[i]

          // Map the step kind to a stage
          const currentStage =
            STEP_KIND_TO_STAGE[step.kind] || STAGES.FIRST_ROUND

          // If the stage changed, record the flow
          if (previousStage !== currentStage) {
            const fromMap = stageFlow.get(previousStage) || new Map()
            const currentCount = fromMap.get(currentStage) || 0
            fromMap.set(currentStage, currentCount + 1)
            stageFlow.set(previousStage, fromMap)

            previousStage = currentStage
          }
        }

        // Capture the final outcome
        const finalStage = previousStage
        let outcomeStage

        if (post.status === JobApplicationStatus.OFFER_RECEIVED) {
          outcomeStage = STAGES.OFFER
        } else if (post.status === JobApplicationStatus.REJECTED) {
          outcomeStage = STAGES.REJECTED
        } else {
          // Stay at the final step if still in progress
          return
        }

        // Only record if the outcome is different from the final step
        if (finalStage !== outcomeStage) {
          const fromMap = stageFlow.get(finalStage) || new Map()
          const currentCount = fromMap.get(outcomeStage) || 0
          fromMap.set(outcomeStage, currentCount + 1)
          stageFlow.set(finalStage, fromMap)
        }
      })

      // Convert the stage flow map to Sankey data format
      const sankeyData: any[] = [['From', 'To', 'Weight']]

      stageFlow.forEach((toMap, fromStage) => {
        toMap.forEach((count, toStage) => {
          if (count > 0) {
            sankeyData.push([fromStage, toStage, count])
          }
        })
      })

      console.log('Sankey data:', sankeyData)
      return sankeyData
    } catch (error) {
      console.error('Error processing interview funnel data:', error)
      return []
    }
  }

  // If no data to display
  if ((!chartData || chartData.length <= 1) && !isLoading) {
    return (
      <div className="rounded-lg border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-2 flex flex-col space-y-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <h2 className="text-xl font-semibold">Interview Journey Flow</h2>
          <TimePeriodSelector
            selectedPeriod={timePeriod}
            onChange={setTimePeriod}
          />
        </div>
        <div className="flex h-64 flex-col items-center justify-center">
          <p className="text-gray-500">
            {dataError || 'No interview journey data available.'}
          </p>
          {jobPosts?.length > 0 && (
            <p className="mt-2 text-sm text-gray-400">
              Record interview stages for your applications to see the flow of
              candidates through your interview process.
            </p>
          )}
        </div>
      </div>
    )
  }

  const darkModeOptions = isDarkMode
    ? {
        backgroundColor: '#111827', // dark:bg-gray-900
        sankey: {
          node: {
            colors: [
              '#60a5fa',
              '#93c5fd',
              '#60a5fa',
              '#3b82f6',
              '#2563eb',
              '#ef4444',
            ],
            label: {
              color: '#f1f5f9', // dark:text-slate-100
              fontSize: 14,
              bold: true,
            },
          },
          link: {
            colorMode: 'gradient',
            colors: ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#ef4444'],
          },
        },
      }
    : {
        backgroundColor: '#ffffff',
        sankey: {
          node: {
            colors: [
              '#3b82f6',
              '#60a5fa',
              '#93c5fd',
              '#2563eb',
              '#1d4ed8',
              '#ef4444',
            ],
            label: {
              fontSize: 14,
              bold: true,
            },
          },
          link: {
            colorMode: 'gradient',
          },
        },
      }

  return (
    <div className="rounded-lg border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-2 flex flex-col space-y-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h2 className="text-xl font-semibold">Interview Journey Flow</h2>
        <TimePeriodSelector
          selectedPeriod={timePeriod}
          onChange={setTimePeriod}
        />
      </div>

      <div>
        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          This Sankey diagram shows how candidates flow through your interview
          stages.
        </p>

        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              Loading chart data...
            </p>
          </div>
        ) : (
          <div className="relative h-[300px] w-full">
            <Chart
              chartType="Sankey"
              width="100%"
              height="300px"
              data={chartData}
              options={darkModeOptions}
            />
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          <p>
            <span className="font-medium">Tip:</span> Hover over the flows to
            see details about candidates moving between stages.
          </p>
        </div>
      </div>
    </div>
  )
}

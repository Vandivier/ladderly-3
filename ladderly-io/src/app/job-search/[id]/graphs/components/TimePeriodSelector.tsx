'use client'

import React from 'react'
import { TIME_PERIODS, TimePeriod } from './graphUtils'

interface TimePeriodSelectorProps {
  selectedPeriod: TimePeriod
  onChange: (period: TimePeriod) => void
}

export function TimePeriodSelector({
  selectedPeriod,
  onChange,
}: TimePeriodSelectorProps) {
  return (
    <div className="flex flex-wrap space-x-1 rounded-md bg-gray-100 p-1 dark:bg-gray-800 sm:flex-nowrap">
      {Object.keys(TIME_PERIODS).map((period) => (
        <button
          key={period}
          className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            selectedPeriod === period
              ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-700 dark:text-blue-400'
              : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
          onClick={() => onChange(period as TimePeriod)}
        >
          {period}
        </button>
      ))}
    </div>
  )
}

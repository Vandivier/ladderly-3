import React from 'react'

interface HappinessSliderProps {
  value: number | undefined
  onChange: (value: number | undefined) => void
  disabled?: boolean
  id?: string
}

export const HappinessSlider: React.FC<HappinessSliderProps> = ({
  value,
  onChange,
  disabled = false,
  id = 'happiness',
}) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium dark:text-gray-300"
      >
        Happiness Level: {value ? `${value}/10` : 'Not set'}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="range"
          id={id}
          min="1"
          max="10"
          value={value ?? ''}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-blue-600 sm:flex-1"
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="mt-1 w-fit rounded bg-gray-200 px-2 py-1 text-xs font-medium hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 sm:mt-0"
          disabled={disabled}
        >
          Clear
        </button>
      </div>
    </div>
  )
}

export default HappinessSlider

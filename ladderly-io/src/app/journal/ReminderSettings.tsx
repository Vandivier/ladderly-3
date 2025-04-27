'use client'

import React, { useState } from 'react'
import { api } from '~/trpc/react'

export const ReminderSettings = () => {
  const [isExpanded, setIsExpanded] = useState(false)

  // Get current reminder settings
  const { data: settings, isLoading } =
    api.journal.getUserReminderSettings.useQuery(undefined, {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
    })

  // Update reminder settings mutation
  const { mutate: updateSettings, isPending: isUpdating } =
    api.journal.updateReminderSettings.useMutation({
      onSuccess: () => {
        // Show success feedback
        setUpdateStatus('success')
        setTimeout(() => setUpdateStatus('idle'), 3000)
      },
      onError: (error) => {
        // Show error feedback
        setUpdateStatus('error')
        console.error(
          'Failed to update reminder settings:',
          error.message || 'Unknown error',
        )
        setTimeout(() => setUpdateStatus('idle'), 3000)
      },
    })

  // Local state for form
  const [isEnabled, setIsEnabled] = useState(false)
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>(
    'WEEKLY',
  )
  const [updateStatus, setUpdateStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle')

  // Update local state when settings are loaded
  React.useEffect(() => {
    if (settings) {
      setIsEnabled(settings.isEnabled)
      setFrequency(settings.frequency)
    }
  }, [settings])

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateSettings({
      isEnabled,
      frequency,
    })
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">
          Loading reminder settings...
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold dark:text-gray-100">
          Notification Settings
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {isExpanded ? 'Hide' : 'Show'}
        </button>
      </div>

      {isExpanded && (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2 flex items-center text-sm font-medium dark:text-gray-300">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="mr-2"
              />
              Enable journal entry reminders
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Get notified when it{"'"}s time to create a new journal entry
            </p>
          </div>

          {isEnabled && (
            <div className="mb-4">
              <label
                htmlFor="frequency"
                className="mb-1 block text-sm font-medium dark:text-gray-300"
              >
                Reminder Frequency
              </label>
              <select
                id="frequency"
                value={frequency}
                onChange={(e) =>
                  setFrequency(e.target.value as 'DAILY' | 'WEEKLY' | 'MONTHLY')
                }
                className="w-full rounded border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
          )}

          {/* Form actions */}
          <div className="mt-4 flex items-center justify-between">
            <div>
              {updateStatus === 'success' && (
                <span className="text-sm text-green-600 dark:text-green-400">
                  Settings updated successfully!
                </span>
              )}
              {updateStatus === 'error' && (
                <span className="text-sm text-red-600 dark:text-red-400">
                  Failed to update settings. Please try again.
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 disabled:bg-gray-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:disabled:bg-gray-700"
            >
              {isUpdating ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default ReminderSettings

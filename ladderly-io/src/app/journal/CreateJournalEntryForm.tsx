'use client'

import { useRouter } from 'next/navigation'
import React, { useMemo, useState } from 'react'
import { z } from 'zod'
import { Form } from '~/app/core/components/Form'
import { api } from '~/trpc/react'
import { WeeklyEntryCountIndicator } from './WeeklyEntryCountIndicator'
import type { PaymentTierEnum } from '@prisma/client'

// Zod schema for validating journal entry form
const journalEntrySchema = z.object({
  content: z
    .string()
    .min(1, { message: 'Content is required' })
    .max(500, { message: 'Content must be 500 characters or less' }),
  entryType: z.enum(['WIN', 'PAIN_POINT', 'LEARNING', 'OTHER']),
  isCareerRelated: z.boolean().default(true),
  happiness: z.number().min(1).max(10).optional(),
})

type JournalEntryFormValues = z.infer<typeof journalEntrySchema>

interface CreateJournalEntryFormProps {
  userTier: PaymentTierEnum
}

export const CreateJournalEntryForm = ({
  userTier,
}: CreateJournalEntryFormProps) => {
  const router = useRouter()
  const utils = api.useUtils()
  const [error, setError] = useState<string | null>(null)
  const [characterCount, setCharacterCount] = useState(0)
  const [weeklyLimit] = useState(21)
  const [contentValue, setContentValue] = useState('')
  const [isCareerRelated, setIsCareerRelated] = useState(true)
  const [entryType, setEntryType] = useState<
    'WIN' | 'PAIN_POINT' | 'LEARNING' | 'OTHER'
  >('WIN')
  const [happiness, setHappiness] = useState<number | undefined>(undefined)

  // Get the date from a week ago - memoize to prevent recreating on every render
  const oneWeekAgo = useMemo(() => {
    const date = new Date()
    date.setDate(date.getDate() - 7)
    // Set hours, minutes, seconds to 0 to ensure consistent caching
    date.setHours(0, 0, 0, 0)
    return date
  }, [])

  // Create a stable query key
  const queryParams = useMemo(
    () => ({
      fromDate: oneWeekAgo,
    }),
    [oneWeekAgo],
  )

  // Get weekly entry count for user
  const weeklyEntriesQuery = api.journal.getUserEntries.useQuery(queryParams, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
  })

  const weeklyEntryCount = weeklyEntriesQuery.data?.totalCount ?? 0

  // Create journal entry mutation
  const createEntryMutation = api.journal.createEntry.useMutation({
    onSuccess: async () => {
      await utils.journal.getUserEntries.invalidate()
      router.refresh()
      // Reset form after successful submission
      setCharacterCount(0)
      setContentValue('')
      setError(null)
    },
    onError: (error) => {
      setError(error.message)
    },
  })

  // Handle form submission
  const handleSubmit = async (values: JournalEntryFormValues) => {
    try {
      // Ensure content is included from our tracked state
      values.content = contentValue ?? values.content

      // Validate form with schema
      const valid = journalEntrySchema.safeParse(values)
      if (!valid.success) {
        const firstError = valid.error.errors[0]?.message ?? 'Invalid form data'
        setError(firstError)
        return
      }

      createEntryMutation.mutate(values)
    } catch (error) {
      setError('An unexpected error occurred')
    }
  }

  // Update character count as user types
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setContentValue(value)
    setCharacterCount(value.length)
  }

  // Handle career-related checkbox change
  const handleCareerRelatedChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setIsCareerRelated(e.target.checked)
  }

  // Handle entry type change
  const handleEntryTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEntryType(e.target.value as 'WIN' | 'PAIN_POINT' | 'LEARNING' | 'OTHER')
  }

  const isLoading = createEntryMutation.isPending
  const isWeeklyLoadingData = weeklyEntriesQuery.isLoading

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <Form
        onSubmit={
          weeklyEntryCount >= weeklyLimit
            ? () => {
                // Do nothing when weekly limit is reached
                console.log('Weekly limit reached, form submission disabled')
              }
            : handleSubmit
        }
        submitText={
          isLoading
            ? 'Saving...'
            : weeklyEntryCount >= weeklyLimit
              ? 'Weekly Limit Reached'
              : 'Save Entry'
        }
        initialValues={{
          content: contentValue,
          entryType: entryType,
          isCareerRelated: isCareerRelated,
          happiness: happiness,
        }}
      >
        {/* Text area for entry content */}
        <div className="mb-4">
          <label htmlFor="content" className="sr-only">
            Journal entry content
          </label>
          <textarea
            id="content"
            name="content"
            value={contentValue}
            className="w-full rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            placeholder="What happened recently? Use hashtags like #newjob to mark special achievements."
            rows={3}
            maxLength={500}
            required
            onChange={handleContentChange}
            disabled={
              isLoading ||
              isWeeklyLoadingData ||
              weeklyEntryCount >= weeklyLimit
            }
          />

          <div className="mb-4 flex items-center justify-between">
            <div className="mt-1 text-right text-sm text-gray-500 dark:text-gray-400">
              {characterCount}/500 characters
            </div>
            <WeeklyEntryCountIndicator
              isWeeklyLoadingData={isWeeklyLoadingData}
              weeklyEntryCount={weeklyEntryCount}
              weeklyLimit={weeklyLimit}
              userTier={userTier}
            />
          </div>
        </div>

        {/* Form controls in a row */}
        <div className="mb-2 flex flex-row items-center gap-6">
          {/* Entry type dropdown */}
          <div className="w-1/2">
            <label
              htmlFor="entryType"
              className="mb-1 block text-sm font-medium dark:text-gray-300"
            >
              Entry Type
            </label>
            <select
              id="entryType"
              name="entryType"
              value={entryType}
              onChange={handleEntryTypeChange}
              className="w-full rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              disabled={
                isLoading ||
                isWeeklyLoadingData ||
                weeklyEntryCount >= weeklyLimit
              }
            >
              <option value="WIN">Win</option>
              <option value="PAIN_POINT">Pain Point</option>
              <option value="LEARNING">Learning</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Happiness slider */}
          <div className="w-1/2">
            <label
              htmlFor="happiness"
              className="mb-1 block text-sm font-medium dark:text-gray-300"
            >
              Happiness Level: {happiness ? `${happiness}/10` : 'Not set'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                id="happiness"
                name="happiness"
                min="1"
                max="10"
                value={happiness ?? ''}
                onChange={(e) => setHappiness(Number(e.target.value))}
                className="flex-1"
                disabled={
                  isLoading ||
                  isWeeklyLoadingData ||
                  weeklyEntryCount >= weeklyLimit
                }
              />
              <button
                type="button"
                onClick={() => setHappiness(undefined)}
                className="rounded bg-gray-200 px-2 py-1 text-sm hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                disabled={
                  isLoading ||
                  isWeeklyLoadingData ||
                  weeklyEntryCount >= weeklyLimit
                }
              >
                Clear
              </button>
            </div>
          </div>

          {/* Checkbox directly in flex container */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isCareerRelated"
              name="isCareerRelated"
              checked={isCareerRelated}
              onChange={handleCareerRelatedChange}
              className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              disabled={
                isLoading ||
                isWeeklyLoadingData ||
                weeklyEntryCount >= weeklyLimit
              }
            />
            <label
              htmlFor="isCareerRelated"
              className="ml-2 text-sm font-medium dark:text-gray-300"
            >
              Career-Related
            </label>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}
      </Form>
    </div>
  )
}

export default CreateJournalEntryForm

'use client'

import { useRouter } from 'next/navigation'
import React, { useMemo, useState } from 'react'
import { z } from 'zod'
import { Form } from '~/app/core/components/Form'
import LabeledCheckboxField from '~/app/core/components/LabeledCheckboxField'
import { api } from '~/trpc/react'

// Zod schema for validating journal entry form
const journalEntrySchema = z.object({
  content: z
    .string()
    .min(1, { message: 'Content is required' })
    .max(500, { message: 'Content must be 500 characters or less' }),
  entryType: z.enum(['WIN', 'PAIN_POINT', 'LEARNING', 'OTHER']),
  isCareerRelated: z.boolean().default(true),
})

type JournalEntryFormValues = z.infer<typeof journalEntrySchema>

export const CreateJournalEntryForm = () => {
  const router = useRouter()
  const utils = api.useUtils()
  const [error, setError] = useState<string | null>(null)
  const [characterCount, setCharacterCount] = useState(0)
  const [weeklyLimit] = useState(21)
  const [contentValue, setContentValue] = useState('')

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

  const weeklyEntryCount = weeklyEntriesQuery.data?.totalCount || 0

  // Create journal entry mutation
  const createEntryMutation = api.journal.createEntry.useMutation({
    onSuccess: () => {
      utils.journal.getUserEntries.invalidate()
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
      values.content = contentValue || values.content

      // Validate form with schema
      const valid = journalEntrySchema.safeParse(values)
      if (!valid.success) {
        const firstError = valid.error.errors[0]?.message || 'Invalid form data'
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

  const isLoading = createEntryMutation.isPending
  const isWeeklyLoadingData = weeklyEntriesQuery.isLoading

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">Create Journal Entry</h2>

      {/* Weekly entry count indicator */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Weekly entries:{' '}
          {isWeeklyLoadingData
            ? 'Loading...'
            : `${weeklyEntryCount} / ${weeklyLimit}`}
        </div>

        {weeklyEntryCount >= weeklyLimit ? (
          <div className="rounded-md bg-red-100 px-3 py-1 text-sm text-red-600">
            Weekly limit reached
          </div>
        ) : weeklyEntryCount >= weeklyLimit - 3 ? (
          <div className="rounded-md bg-yellow-100 px-3 py-1 text-sm text-yellow-600">
            Approaching weekly limit
          </div>
        ) : null}
      </div>

      {/* @ts-ignore - Work around typing issues with Form component */}
      <Form
        onSubmit={weeklyEntryCount >= weeklyLimit ? () => {} : handleSubmit}
        submitText={
          isLoading
            ? 'Saving...'
            : weeklyEntryCount >= weeklyLimit
              ? 'Weekly Limit Reached'
              : 'Save Entry'
        }
        initialValues={{
          content: contentValue,
          entryType: 'WIN',
          isCareerRelated: true,
        }}
      >
        {/* Text area for entry content */}
        <div className="mb-4">
          <label htmlFor="content" className="mb-1 block text-sm font-medium">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            value={contentValue}
            className="w-full rounded-md border border-gray-300 p-2"
            placeholder="What happened today? Use #hashtags for special items or categories."
            rows={4}
            maxLength={500}
            required
            onChange={handleContentChange}
            disabled={
              isLoading ||
              isWeeklyLoadingData ||
              weeklyEntryCount >= weeklyLimit
            }
          />
          <div className="mt-1 text-right text-sm text-gray-500">
            {characterCount}/500 characters
          </div>
        </div>

        {/* Entry type dropdown */}
        <div className="mb-4">
          <label htmlFor="entryType" className="mb-1 block text-sm font-medium">
            Entry Type <span className="text-red-500">*</span>
          </label>
          <select
            id="entryType"
            name="entryType"
            className="w-full rounded-md border border-gray-300 p-2"
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

        {/* Toggle switches */}
        <div className="mb-4 space-y-2">
          <LabeledCheckboxField
            name="isCareerRelated"
            label="Career-related entry"
            labelProps={{ className: 'text-sm font-medium' }}
            disabled={
              isLoading ||
              isWeeklyLoadingData ||
              weeklyEntryCount >= weeklyLimit
            }
          />
        </div>

        {/* Hashtag suggestion */}
        <div className="mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
          <p>
            <strong>Tip:</strong> Use hashtags like #newjob, #promotion, or
            #graduation in your content to mark special achievements.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-100 p-2 text-sm text-red-600">
            {error}
          </div>
        )}
      </Form>
    </div>
  )
}

export default CreateJournalEntryForm

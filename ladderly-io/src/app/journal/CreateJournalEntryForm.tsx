'use client'

import React, { useState } from 'react'
import { Form } from '~/app/core/components/Form'
import LabeledTextField from '~/app/core/components/LabeledTextField'
import LabeledCheckboxField from '~/app/core/components/LabeledCheckboxField'
import { z } from 'zod'
import { api } from '~/trpc/react'
import { useRouter } from 'next/navigation'

// Zod schema for validating journal entry form
const journalEntrySchema = z.object({
  content: z
    .string()
    .min(1, { message: 'Content is required' })
    .max(500, { message: 'Content must be 500 characters or less' }),
  entryType: z.enum(['WIN', 'PAIN_POINT', 'LEARNING', 'OTHER']),
  isCareerRelated: z.boolean().default(true),
  workstreams: z
    .array(z.string())
    .min(1, { message: 'At least one workstream is required' }),
})

type JournalEntryFormValues = z.infer<typeof journalEntrySchema>

export const CreateJournalEntryForm = () => {
  const router = useRouter()
  const utils = api.useUtils()
  const [error, setError] = useState<string | null>(null)
  const [newWorkstream, setNewWorkstream] = useState('')
  const [selectedWorkstreams, setSelectedWorkstreams] = useState<string[]>([])
  const [characterCount, setCharacterCount] = useState(0)
  const [weeklyLimit] = useState(21)

  // Get the date from a week ago
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  // Fetch user's existing workstreams
  const { data: workstreams = [] } = api.journal.getUserWorkstreams.useQuery()

  // Get weekly entry count for user
  const weeklyEntriesQuery = api.journal.getUserEntries.useQuery({
    fromDate: oneWeekAgo,
  })

  const weeklyEntryCount = weeklyEntriesQuery.data?.totalCount || 0

  // Create journal entry mutation
  const createEntryMutation = api.journal.createEntry.useMutation({
    onSuccess: () => {
      utils.journal.getUserEntries.invalidate()
      utils.journal.getUserWorkstreams.invalidate()
      router.refresh()
      // Reset form after successful submission
      setSelectedWorkstreams([])
      setCharacterCount(0)
      setError(null)
    },
    onError: (error) => {
      setError(error.message)
    },
  })

  // Handle form submission
  const handleSubmit = async (values: JournalEntryFormValues) => {
    try {
      // Add selected workstreams to form values
      values.workstreams = selectedWorkstreams

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

  // Handle workstream chip selection
  const handleWorkstreamToggle = (workstream: string) => {
    if (selectedWorkstreams.includes(workstream)) {
      setSelectedWorkstreams(
        selectedWorkstreams.filter((w) => w !== workstream),
      )
    } else {
      setSelectedWorkstreams([...selectedWorkstreams, workstream])
    }
  }

  // Handle adding new workstream
  const handleAddWorkstream = () => {
    if (
      newWorkstream.trim() &&
      !selectedWorkstreams.includes(newWorkstream.trim())
    ) {
      setSelectedWorkstreams([...selectedWorkstreams, newWorkstream.trim()])
      setNewWorkstream('')
    }
  }

  // Handle pressing Enter to add a workstream
  const handleWorkstreamKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddWorkstream()
    }
  }

  // Update character count as user types
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharacterCount(e.target.value.length)
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
        onSubmit={handleSubmit}
        submitText={isLoading ? 'Saving...' : 'Save Entry'}
        initialValues={{
          content: '',
          entryType: 'WIN',
          isCareerRelated: true,
          workstreams: [],
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

        {/* Workstreams section */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">
            Workstreams <span className="text-red-500">*</span>
          </label>

          {/* Workstream chips */}
          <div className="mb-2 flex flex-wrap gap-2">
            {workstreams.map((workstream) => (
              <button
                key={workstream}
                type="button"
                onClick={() => handleWorkstreamToggle(workstream)}
                className={`rounded-full px-3 py-1 text-sm ${
                  selectedWorkstreams.includes(workstream)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                disabled={
                  isLoading ||
                  isWeeklyLoadingData ||
                  weeklyEntryCount >= weeklyLimit
                }
              >
                {workstream}
              </button>
            ))}
          </div>

          {/* Add new workstream */}
          <div className="flex">
            <input
              type="text"
              value={newWorkstream}
              onChange={(e) => setNewWorkstream(e.target.value)}
              onKeyDown={handleWorkstreamKeyDown}
              placeholder="Add new workstream"
              className="flex-1 rounded-l-md border border-gray-300 p-2"
              disabled={
                isLoading ||
                isWeeklyLoadingData ||
                weeklyEntryCount >= weeklyLimit
              }
            />
            <button
              type="button"
              onClick={handleAddWorkstream}
              className="rounded-r-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              disabled={
                !newWorkstream.trim() ||
                isLoading ||
                isWeeklyLoadingData ||
                weeklyEntryCount >= weeklyLimit
              }
            >
              Add
            </button>
          </div>

          {/* Selected workstreams */}
          {selectedWorkstreams.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium">Selected:</p>
              <div className="flex flex-wrap gap-1">
                {selectedWorkstreams.map((workstream) => (
                  <div
                    key={workstream}
                    className="mt-1 flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
                  >
                    {workstream}
                    <button
                      type="button"
                      onClick={() => handleWorkstreamToggle(workstream)}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                      disabled={
                        isLoading ||
                        isWeeklyLoadingData ||
                        weeklyEntryCount >= weeklyLimit
                      }
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedWorkstreams.length === 0 && (
            <p className="mt-1 text-sm text-red-500">
              Please select at least one workstream
            </p>
          )}
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

        {/* Form controls */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-300"
            disabled={
              isLoading ||
              isWeeklyLoadingData ||
              weeklyEntryCount >= weeklyLimit ||
              selectedWorkstreams.length === 0
            }
          >
            {isLoading ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </Form>
    </div>
  )
}

export default CreateJournalEntryForm

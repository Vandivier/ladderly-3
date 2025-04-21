'use client'

import React, { useState } from 'react'
import { api } from '~/trpc/react'

export const CreateJobSearchModal = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]!,
  )
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const { refetch } = api.jobSearch.getUserJobSearches.useQuery()

  const { mutate: createJobSearch } = api.jobSearch.createJobSearch.useMutation(
    {
      onSuccess: async () => {
        await refetch()
        setIsOpen(false)
        setName('')
        setError('')
        setStartDate(new Date().toISOString().split('T')[0]!)
        setSelectedFile(null)
      },
      onError: (error) => {
        setError(error.message || 'Failed to create job search')
        setIsSubmitting(false)
      },
    },
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    if (!name.trim()) {
      setError('Job search name is required')
      setIsSubmitting(false)
      return
    }

    if (selectedFile) {
      console.log('CSV File selected, implement parsing and upload logic.')
      alert('CSV Upload not yet implemented.')
      setIsSubmitting(false)
      return
    }

    createJobSearch({
      name: name.trim(),
      startDate: new Date(startDate),
      isActive: true,
    })
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Create New Job Search
      </button>

      {isOpen && (
        <div className="bg-opacity/50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">Create New Job Search</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium"
                >
                  Job Search Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Summer 2024 Job Search"
                  className="w-full rounded-md border border-gray-300 p-2"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="startDate"
                  className="mb-2 block text-sm font-medium"
                >
                  Start Date
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2"
                  required
                />
              </div>

              <div className="my-4 border-t border-gray-200 pt-4">
                <p className="mb-2 text-sm text-gray-600">
                  Or create from a CSV file:
                </p>
                {/* Post-Level CSV Upload */}
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="csvFilePostLevel"
                    className="inline-block cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    Choose Post-Level CSV
                  </label>
                  {/* Hidden actual file input */}
                  <input
                    id="csvFilePostLevel"
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      let fileToSet: File | null = null
                      if (e.target.files && e.target.files.length > 0) {
                        const firstFile = e.target.files[0]
                        if (firstFile) {
                          fileToSet = firstFile
                        }
                      }
                      setSelectedFile(fileToSet)
                    }}
                    className="absolute h-0 w-0 opacity-0"
                  />
                  {/* Display selected file name */}
                  {selectedFile && (
                    <span className="ml-3 text-sm text-gray-600">
                      {selectedFile.name}
                    </span>
                  )}
                </div>

                {/* Round-Level CSV Upload (Coming Soon) */}
                <div className="mt-2 flex items-center gap-2">
                  <label
                    htmlFor="csvFileRoundLevel"
                    className="inline-block cursor-not-allowed rounded-md border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400 shadow-sm"
                  >
                    Choose Round-Level CSV (Soon)
                  </label>
                  {/* Hidden input, no handler yet */}
                  <input
                    id="csvFileRoundLevel"
                    type="file"
                    accept=".csv"
                    disabled
                    className="absolute h-0 w-0 opacity-0"
                  />
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Ensure your CSV follows the correct format. See a sample at{' '}
                  <a
                    href="/blog/2024-02-12-resume-optimization#job-search-spreadsheet-tools"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    this blog post
                  </a>
                  .
                </p>
              </div>

              {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    setName('')
                    setError('')
                    setStartDate(new Date().toISOString().split('T')[0]!)
                    setSelectedFile(null)
                  }}
                  className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

'use client'

import React, { useState } from 'react'
import { api } from '~/trpc/react'
import Papa from 'papaparse'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

interface ParsedJobPostRow {
  Company?: string
  'Job Post Title'?: string
  'Job Post URL'?: string | null
  'Resume Version'?: string | null
  Referral?: string | null
  'Contact Name'?: string | null
  ContactUrl?: string | null
  'Initial Outreach Date'?: string | null
  'Initial App Date'?: string | null
  'Last Action Date'?: string | null
  'Inbound Opportunity'?: string | null
  Status?: string | null
  Salary?: string | null
  TC?: string | null
  Notes?: string | null
  [key: string]: string | null | undefined
}

// Define a Zod schema for job post data that matches API expectations
const JobPostCsvRowSchema = z.object({
  Company: z.string().min(1, 'Company name is required'),
  'Job Post Title': z.string().min(1, 'Job title is required'),
  'Job Post URL': z.string().nullable().optional(),
  'Resume Version': z.string().nullable().optional(),
  'Contact Name': z.string().nullable().optional(),
  ContactUrl: z.string().nullable().optional(),
  Referral: z.string().nullable().optional(),
  'Initial Outreach Date': z.string().nullable().optional(),
  'Initial App Date': z.string().nullable().optional(),
  'Last Action Date': z.string().nullable().optional(),
  'Inbound Opportunity': z.string().nullable().optional(),
  Status: z.string().nullable().optional(),
  Salary: z.string().nullable().optional(),
  TC: z.string().nullable().optional(),
  Notes: z.string().nullable().optional(),
})

export const CreateJobTrackerModal = () => {
  const router = useRouter()
  const utils = api.useUtils()
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]!,
  )
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'parsing' | 'submitting' | 'success' | 'error'
  >('idle')
  const [error, setError] = useState('')

  const { mutate: createJobSearchManual } =
    api.jobSearch.createJobSearch.useMutation({
      onSuccess: async () => {
        router.refresh()
        await utils.jobSearch.getUserJobSearches.invalidate()
        setIsOpen(false)
        setName('')
        setError('')
        setStartDate(new Date().toISOString().split('T')[0]!)
        setSelectedFile(null)
        setSubmitStatus('success')
        setTimeout(() => setSubmitStatus('idle'), 3000)
      },
      onError: (error) => {
        setError(error.message ?? 'Failed to create job search tracker')
        setSubmitStatus('error')
        setIsSubmitting(false)
      },
      onMutate: () => {
        setSubmitStatus('submitting')
        setIsSubmitting(true)
        setError('')
      },
    })

  const { mutate: createJobSearchCsv } =
    api.jobSearch.csv.createFromCsv.useMutation({
      onSuccess: async (data) => {
        router.refresh()
        await utils.jobSearch.getUserJobSearches.invalidate()
        setIsOpen(false)
        setName('')
        setError('')
        setStartDate(new Date().toISOString().split('T')[0]!)
        setSelectedFile(null)
        setSubmitStatus('success')
        console.log(
          `Successfully created job search with ${data.jobPostsCreated} applications.`,
        )
        setTimeout(() => setSubmitStatus('idle'), 3000)
      },
      onError: (error) => {
        let detailedError =
          error.message ?? 'Failed to create job search tracker from CSV'
        try {
          const dataError = error.data?.zodError
          if (dataError?.fieldErrors) {
            const firstField = Object.keys(dataError.fieldErrors)[0]
            if (firstField && dataError.fieldErrors[firstField]?.[0]) {
              detailedError = `CSV Validation Error: ${dataError.fieldErrors[firstField]?.[0]} in column '${firstField}'. Please check row data.`
            }
          }
        } catch {
          /* Ignore parsing errors */
        }
        setError(detailedError)
        setSubmitStatus('error')
        setIsSubmitting(false)
      },
      onMutate: () => {
        setSubmitStatus('submitting')
        setIsSubmitting(true)
        setError('')
      },
    })

  const handleFileParseAndSubmit = (file: File) => {
    setSubmitStatus('parsing')
    setIsSubmitting(true)
    setError('')

    if (!name.trim()) {
      setError('Job search tracker name is required when uploading CSV')
      setIsSubmitting(false)
      setSubmitStatus('idle')
      return
    }

    Papa.parse<ParsedJobPostRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.error('CSV Parsing Errors:', results.errors)
          setError(
            `Error parsing CSV: ${results.errors[0]?.message ?? 'Unknown error'}. Please check file format.`,
          )
          setIsSubmitting(false)
          setSubmitStatus('error')
          return
        }

        const validRows = results.data.filter(
          (row) => row.Company && row['Job Post Title'],
        )

        if (validRows.length === 0) {
          setError(
            "CSV file appears to be empty or doesn't contain valid job post data.",
          )
          setIsSubmitting(false)
          setSubmitStatus('error')
          return
        }

        try {
          // Validate each row with the schema to ensure data quality and structure
          // This gives us early validation feedback before sending to the API
          validRows.forEach((row) => {
            const result = JobPostCsvRowSchema.safeParse(row)
            if (!result.success) {
              throw new Error(`Invalid row data: ${result.error.message}`)
            }
          })

          createJobSearchCsv({
            name: name.trim(),
            startDate: new Date(startDate),
            isActive: true,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            jobPosts: validRows as unknown as any,
          })
        } catch (validationError) {
          console.error('CSV Validation Error:', validationError)
          setError(
            (validationError as Error).message || 'Invalid data format in CSV',
          )
          setIsSubmitting(false)
          setSubmitStatus('error')
        }
      },
      error: (error) => {
        console.error('CSV Parsing Failed:', error)
        setError(`Failed to read CSV file: ${error.message}`)
        setIsSubmitting(false)
        setSubmitStatus('error')
      },
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      setSubmitStatus('idle')
    }
    setError('')

    if (selectedFile) {
      handleFileParseAndSubmit(selectedFile)
    } else {
      if (!name.trim()) {
        setError('Job search tracker name is required')
        setIsSubmitting(false)
        return
      }
      createJobSearchManual({
        name: name.trim(),
        startDate: new Date(startDate),
        isActive: true,
      })
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setName('')
    setError('')
    setStartDate(new Date().toISOString().split('T')[0]!)
    setSelectedFile(null)
    setSubmitStatus('idle')
    setIsSubmitting(false)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Create New Job Search Tracker
      </button>

      {isOpen && (
        <div className="bg-opacity/50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-bold dark:text-white">
              Create New Job Search Tracker
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium dark:text-gray-200"
                >
                  Job Search Tracker Name*
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Summer 2024 Job Search Tracker"
                  className="w-full rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="startDate"
                  className="mb-2 block text-sm font-medium dark:text-gray-200"
                >
                  Start Date*
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="my-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">
                  Or populate applications from a Post-Level CSV file:
                </p>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="csvFilePostLevel"
                    className={`inline-block rounded-md border px-4 py-2 text-sm font-medium shadow-sm ${isSubmitting ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500' : 'cursor-pointer border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}
                  >
                    {selectedFile ? 'Change File' : 'Choose Post-Level CSV'}
                  </label>
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
                      setError('')
                      setSubmitStatus('idle')
                    }}
                    className="absolute size-0 opacity-0"
                    disabled={isSubmitting}
                  />
                  {selectedFile && !isSubmitting && (
                    <span
                      className="ml-3 truncate text-sm text-gray-600 dark:text-gray-300"
                      title={selectedFile.name}
                    >
                      {selectedFile.name}
                    </span>
                  )}
                  {isSubmitting && selectedFile && (
                    <span className="ml-3 text-sm text-blue-600 dark:text-blue-400">
                      {submitStatus === 'parsing' && 'Parsing...'}
                      {submitStatus === 'submitting' && 'Uploading...'}
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Find a sample CSV and format guide at{' '}
                  <a
                    href="/blog/2024-02-12-resume-optimization#job-search-spreadsheet-tools"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    this blog post
                  </a>
                  .
                </p>
              </div>

              {error && (
                <p className="mb-4 text-sm text-red-500 dark:text-red-400">
                  {error}
                </p>
              )}
              {submitStatus === 'success' && (
                <p className="mb-4 text-sm text-green-600 dark:text-green-400">
                  Job search created successfully!
                </p>
              )}

              <div className="flex justify-end space-x-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? submitStatus === 'parsing'
                      ? 'Parsing...'
                      : 'Submitting...'
                    : selectedFile
                      ? 'Create from CSV'
                      : 'Create Manually'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

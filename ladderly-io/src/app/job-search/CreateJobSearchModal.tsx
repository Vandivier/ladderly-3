'use client'

import React, { useState } from 'react'
import { api } from '~/trpc/react'
import Papa from 'papaparse'
import { useRouter } from 'next/navigation'

interface ParsedJobPostRow {
  Company?: string
  'Job Post Title'?: string
  'Job Post URL'?: string | null
  'Resume Version'?: string | null
  Referral?: string | null
  'Initial Outreach Date'?: string | null
  'Initial App Date'?: string | null
  'Last Action Date'?: string | null
  'Inbound Opportunity'?: string | null
  Notes?: string | null
  [key: string]: any
}

export const CreateJobSearchModal = () => {
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
        setError(error.message ?? 'Failed to create job search')
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
          error.message ?? 'Failed to create job search from CSV'
        try {
          const dataError = error.data?.zodError
          if (dataError?.fieldErrors) {
            const firstField = Object.keys(dataError.fieldErrors)[0]
            if (firstField && dataError.fieldErrors[firstField]?.[0]) {
              detailedError = `CSV Validation Error: ${dataError.fieldErrors[firstField]?.[0]} in column '${firstField}'. Please check row data.`
            }
          }
        } catch (e) {
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
      setError('Job search name is required when uploading CSV')
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

        console.log('Parsed Valid CSV Rows:', validRows)
        createJobSearchCsv({
          name: name.trim(),
          startDate: new Date(startDate),
          isActive: true,
          jobPosts: validRows as any,
        })
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
        setError('Job search name is required')
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
                  Job Search Name*
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Summer 2024 Job Search"
                  className="w-full rounded-md border border-gray-300 p-2"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="startDate"
                  className="mb-2 block text-sm font-medium"
                >
                  Start Date*
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="my-4 border-t border-gray-200 pt-4">
                <p className="mb-2 text-sm text-gray-600">
                  Or populate applications from a Post-Level CSV file:
                </p>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="csvFilePostLevel"
                    className={`inline-block rounded-md border px-4 py-2 text-sm font-medium shadow-sm ${isSubmitting ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400' : 'cursor-pointer border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
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
                      className="ml-3 truncate text-sm text-gray-600"
                      title={selectedFile.name}
                    >
                      {selectedFile.name}
                    </span>
                  )}
                  {isSubmitting && selectedFile && (
                    <span className="ml-3 text-sm text-blue-600">
                      {submitStatus === 'parsing' && 'Parsing...'}
                      {submitStatus === 'submitting' && 'Uploading...'}
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <label
                    htmlFor="csvFileRoundLevel"
                    className="inline-block cursor-not-allowed rounded-md border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400 shadow-sm"
                  >
                    Choose Round-Level CSV (Soon)
                  </label>
                  <input
                    id="csvFileRoundLevel"
                    type="file"
                    accept=".csv"
                    disabled
                    className="absolute size-0 opacity-0"
                  />
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Find a sample CSV and format guide at{' '}
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
              {submitStatus === 'success' && (
                <p className="mb-4 text-sm text-green-600">
                  Job search created successfully!
                </p>
              )}

              <div className="flex justify-end space-x-2 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
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

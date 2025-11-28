'use client'

import React, { useState } from 'react'
import { api } from '~/trpc/react'
import Papa from 'papaparse'
import { Upload } from 'lucide-react'

interface CsvRow {
  Company: string
  'Job Post Title': string
  'Job Post URL'?: string
  'Resume Version'?: string
  'Initial App Date'?: string
  'Contact Name'?: string
  ContactUrl?: string
  Referral?: string
  'Inbound Opportunity'?: string
  Notes?: string
  Status?: string
  [key: string]: string | undefined
}

interface UploadCsvModalProps {
  onClose: () => void
  onSuccess: () => void
}

export const UploadCsvModal: React.FC<UploadCsvModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState<
    'idle' | 'parsing' | 'uploading' | 'success' | 'error'
  >('idle')

  const { mutate: uploadCsv } = api.jobSearch.csv.createFromCsv.useMutation({
    onSuccess: () => {
      setStatus('success')
      setIsSubmitting(false)
      setTimeout(() => {
        onSuccess()
      }, 1500)
    },
    onError: (error) => {
      console.error('CSV upload error:', error)
      setError(error.message ?? 'Failed to upload CSV data')
      setStatus('error')
      setIsSubmitting(false)
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setSelectedFile(files[0] ?? null)
      setError('')
      setStatus('idle')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      setError('Please select a CSV file to upload')
      return
    }

    setIsSubmitting(true)
    setStatus('parsing')
    setError('')

    Papa.parse<CsvRow>(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.error('CSV parsing errors:', results.errors)
          setError(
            `Error parsing CSV: ${results.errors[0]?.message ?? 'Unknown error'}`,
          )
          setStatus('error')
          setIsSubmitting(false)
          return
        }

        // Validate required fields
        const requiredFields = ['Company', 'Job Post Title']
        const missingFields = requiredFields.filter(
          (field) => !results.meta.fields?.includes(field),
        )

        if (missingFields.length > 0) {
          setError(
            `Missing required fields in CSV: ${missingFields.join(', ')}`,
          )
          setStatus('error')
          setIsSubmitting(false)
          return
        }

        // Process the data
        const jobPosts = results.data.filter(
          (row) => row.Company && row['Job Post Title'],
        )

        if (jobPosts.length === 0) {
          setError('No valid data rows found in the CSV file')
          setStatus('error')
          setIsSubmitting(false)
          return
        }

        setStatus('uploading')

        // Upload data
        uploadCsv({
          name: `Imported Job Search ${new Date().toLocaleDateString()}`,
          startDate: new Date(),
          isActive: true,
          jobPosts,
        })
      },
      error: (error) => {
        console.error('CSV parsing failed:', error)
        setError(`Failed to read CSV file: ${error.message}`)
        setStatus('error')
        setIsSubmitting(false)
      },
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold dark:text-white">
          Upload CSV Data
        </h2>

        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
          Upload a CSV file containing job application data. The file should
          have the following columns:
        </p>

        <div className="mb-4 overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">
                  Column
                </th>
                <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">
                  Required
                </th>
                <th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-300">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-t px-2 py-1 dark:border-gray-600">
                  Company
                </td>
                <td className="border-t px-2 py-1 dark:border-gray-600">Yes</td>
                <td className="border-t px-2 py-1 dark:border-gray-600">
                  Company name
                </td>
              </tr>
              <tr>
                <td className="border-t px-2 py-1 dark:border-gray-600">
                  Job Post Title
                </td>
                <td className="border-t px-2 py-1 dark:border-gray-600">Yes</td>
                <td className="border-t px-2 py-1 dark:border-gray-600">
                  Position title
                </td>
              </tr>
              <tr>
                <td className="border-t px-2 py-1 dark:border-gray-600">
                  Status
                </td>
                <td className="border-t px-2 py-1 dark:border-gray-600">No</td>
                <td className="border-t px-2 py-1 dark:border-gray-600">
                  Application status (APPLIED, REJECTED, etc.)
                </td>
              </tr>
              <tr>
                <td className="border-t px-2 py-1 dark:border-gray-600">
                  Job Post URL
                </td>
                <td className="border-t px-2 py-1 dark:border-gray-600">No</td>
                <td className="border-t px-2 py-1 dark:border-gray-600">
                  Link to job posting
                </td>
              </tr>
              <tr>
                <td className="border-t px-2 py-1 dark:border-gray-600">
                  Initial App Date
                </td>
                <td className="border-t px-2 py-1 dark:border-gray-600">No</td>
                <td className="border-t px-2 py-1 dark:border-gray-600">
                  Date applied (YYYY-MM-DD)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <label
                htmlFor="csvFile"
                className={`inline-block rounded-md border px-4 py-2 text-sm font-medium shadow-sm ${isSubmitting
                    ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500'
                    : 'cursor-pointer border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                {selectedFile ? 'Change CSV File' : 'Select CSV File'}
              </label>
              <input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                disabled={isSubmitting}
              />
              {selectedFile && (
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {selectedFile.name}
                </span>
              )}
            </div>
          </div>

          {error && (
            <p className="mb-4 text-sm text-red-500 dark:text-red-400">
              {error}
            </p>
          )}

          {status === 'success' && (
            <p className="mb-4 text-sm text-green-500 dark:text-green-400">
              CSV data uploaded successfully!
            </p>
          )}

          <div className="flex justify-end space-x-2 border-t border-gray-200 pt-4 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
              disabled={isSubmitting || !selectedFile}
            >
              {isSubmitting ? (
                status === 'parsing' ? (
                  'Parsing...'
                ) : (
                  'Uploading...'
                )
              ) : (
                <>
                  <Upload className="mr-2 size-4" /> Upload
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

'use client'

import { IntroJobFamily, JobBoardContactType } from '@prisma/client'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { api } from '~/trpc/react'
import { INTRO_JOB_FAMILY_LABELS } from '../utils'

const INPUT_CLASSES =
  'w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800'
const LABEL_CLASSES = 'mb-1 block font-medium'

export interface JobBoardPostFormValues {
  companyName: string
  jobTitle: string
  description: string
  jobPostUrl: string
  location: string
  isRemote: boolean
  baseSalaryMin: string
  baseSalaryMax: string
  contactType: JobBoardContactType
  introJobFamilies: IntroJobFamily[]
}

const EMPTY_VALUES: JobBoardPostFormValues = {
  companyName: '',
  jobTitle: '',
  description: '',
  jobPostUrl: '',
  location: '',
  isRemote: false,
  baseSalaryMin: '',
  baseSalaryMax: '',
  contactType: JobBoardContactType.POSTER,
  introJobFamilies: [],
}

export const parseSalaryInput = (value: string): number | null => {
  const digits = value.replace(/[^0-9]/g, '')
  return digits === '' ? null : parseInt(digits, 10)
}

export const toJobBoardPostPayload = (values: JobBoardPostFormValues) => ({
  companyName: values.companyName.trim(),
  jobTitle: values.jobTitle.trim(),
  description: values.description.trim() === '' ? null : values.description,
  jobPostUrl: values.jobPostUrl.trim() === '' ? null : values.jobPostUrl.trim(),
  location: values.location.trim(),
  isRemote: values.isRemote,
  baseSalaryMin: parseSalaryInput(values.baseSalaryMin),
  baseSalaryMax: parseSalaryInput(values.baseSalaryMax),
  contactType: values.contactType,
  introJobFamilies:
    values.contactType === JobBoardContactType.POSTER
      ? []
      : values.introJobFamilies,
})

type JobBoardPostFormProps = {
  postId?: number
  initialValues?: Partial<JobBoardPostFormValues>
}

export const JobBoardPostForm = ({
  postId,
  initialValues,
}: JobBoardPostFormProps) => {
  const router = useRouter()
  const utils = api.useUtils()
  const [values, setValues] = useState<JobBoardPostFormValues>({
    ...EMPTY_VALUES,
    ...initialValues,
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSuccess = async (id: number) => {
    await utils.jobBoard.invalidate()
    router.push(`/jobs/${id}`)
    router.refresh()
  }

  const handleError = (error: {
    message: string
    data?: {
      zodError?: {
        fieldErrors: Record<string, string[] | undefined>
      } | null
    } | null
  }) => {
    const fieldErrors = error.data?.zodError?.fieldErrors
    const firstFieldError = fieldErrors
      ? Object.values(fieldErrors)
          .flat()
          .find((message) => message !== undefined)
      : undefined
    setErrorMessage(firstFieldError ?? error.message)
  }

  const createMutation = api.jobBoard.create.useMutation({
    onSuccess: (post) => handleSuccess(post.id),
    onError: handleError,
  })
  const updateMutation = api.jobBoard.update.useMutation({
    onSuccess: (post) => handleSuccess(post.id),
    onError: handleError,
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const setField = <K extends keyof JobBoardPostFormValues>(
    field: K,
    value: JobBoardPostFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  const toggleFamily = (family: IntroJobFamily) => {
    setValues((prev) => ({
      ...prev,
      introJobFamilies: prev.introJobFamilies.includes(family)
        ? prev.introJobFamilies.filter((f) => f !== family)
        : [...prev.introJobFamilies, family],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    const payload = toJobBoardPostPayload(values)

    if (postId) {
      updateMutation.mutate({ id: postId, ...payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={LABEL_CLASSES} htmlFor="companyName">
          Company Name*
        </label>
        <input
          id="companyName"
          className={INPUT_CLASSES}
          value={values.companyName}
          onChange={(e) => setField('companyName', e.target.value)}
          required
          maxLength={120}
        />
      </div>

      <div>
        <label className={LABEL_CLASSES} htmlFor="jobTitle">
          Job Title*
        </label>
        <input
          id="jobTitle"
          className={INPUT_CLASSES}
          value={values.jobTitle}
          onChange={(e) => setField('jobTitle', e.target.value)}
          required
          maxLength={120}
        />
      </div>

      <div>
        <label className={LABEL_CLASSES} htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          className={INPUT_CLASSES}
          value={values.description}
          onChange={(e) => setField('description', e.target.value)}
          rows={5}
          maxLength={5000}
        />
      </div>

      <div>
        <label className={LABEL_CLASSES} htmlFor="jobPostUrl">
          Job Post URL
        </label>
        <input
          id="jobPostUrl"
          className={INPUT_CLASSES}
          value={values.jobPostUrl}
          onChange={(e) => setField('jobPostUrl', e.target.value)}
          placeholder="https://..."
          type="url"
        />
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="grow">
          <label className={LABEL_CLASSES} htmlFor="location">
            Location
          </label>
          <input
            id="location"
            className={INPUT_CLASSES}
            value={values.location}
            onChange={(e) => setField('location', e.target.value)}
            placeholder="City, State or Country"
            maxLength={120}
          />
        </div>
        <label className="mb-2 flex items-center gap-2">
          <input
            type="checkbox"
            checked={values.isRemote}
            onChange={(e) => setField('isRemote', e.target.checked)}
          />
          Remote
        </label>
      </div>

      <div className="flex flex-wrap gap-4">
        <div>
          <label className={LABEL_CLASSES} htmlFor="baseSalaryMin">
            Base Salary Min (USD/year)
          </label>
          <input
            id="baseSalaryMin"
            className={INPUT_CLASSES}
            value={values.baseSalaryMin}
            onChange={(e) => setField('baseSalaryMin', e.target.value)}
            placeholder="e.g. 150000"
            inputMode="numeric"
          />
        </div>
        <div>
          <label className={LABEL_CLASSES} htmlFor="baseSalaryMax">
            Base Salary Max (USD/year)
          </label>
          <input
            id="baseSalaryMax"
            className={INPUT_CLASSES}
            value={values.baseSalaryMax}
            onChange={(e) => setField('baseSalaryMax', e.target.value)}
            placeholder="e.g. 180000"
            inputMode="numeric"
          />
        </div>
      </div>

      <fieldset>
        <legend className={LABEL_CLASSES}>
          How are you attached to this job?*
        </legend>
        <label className="flex items-start gap-2">
          <input
            type="radio"
            className="mt-1"
            name="contactType"
            checked={values.contactType === JobBoardContactType.POSTER}
            onChange={() => setField('contactType', JobBoardContactType.POSTER)}
          />
          <span>
            I am the direct contact for this job (e.g. I am the recruiter or
            hiring manager)
          </span>
        </label>
        <label className="mt-2 flex items-start gap-2">
          <input
            type="radio"
            className="mt-1"
            name="contactType"
            checked={values.contactType === JobBoardContactType.NETWORK_INTRO}
            onChange={() =>
              setField('contactType', JobBoardContactType.NETWORK_INTRO)
            }
          />
          <span>
            I know someone at this company and I am willing to intro candidates
          </span>
        </label>
      </fieldset>

      {values.contactType === JobBoardContactType.NETWORK_INTRO && (
        <fieldset className="ml-6">
          <legend className={LABEL_CLASSES}>
            I can intro candidates to a...*
          </legend>
          {Object.values(IntroJobFamily).map((family) => (
            <label key={family} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={values.introJobFamilies.includes(family)}
                onChange={() => toggleFamily(family)}
              />
              {INTRO_JOB_FAMILY_LABELS[family]}
            </label>
          ))}
        </fieldset>
      )}

      {errorMessage && (
        <p className="text-red-600" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
      >
        {isSubmitting
          ? 'Submitting...'
          : postId
            ? 'Update Job Post'
            : 'Post Job'}
      </button>
    </form>
  )
}

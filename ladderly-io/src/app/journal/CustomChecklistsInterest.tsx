'use client'

import React, { useState } from 'react'
import { api } from '~/trpc/react'

export const CustomChecklistsInterest = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const userProfileQuery = api.user.getUserProfile.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
  })
  const isAlreadyInterested =
    userProfileQuery.data?.hasCustomChecklistsInterest

  const updateUserMutation = api.user.updateUserProfile.useMutation({
    onSuccess: async () => {
      setHasSubmitted(true)
      await userProfileQuery.refetch()
      setIsSubmitting(false)
    },
    onError: (error) => {
      console.error('Error updating profile:', error)
      setIsSubmitting(false)
    },
  })

  const handleExpressInterest = () => {
    if (isSubmitting || isAlreadyInterested) return
    setIsSubmitting(true)
    updateUserMutation.mutate({ hasCustomChecklistsInterest: true })
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-sm dark:border-blue-800 dark:bg-blue-900/20">
      <h3 className="mb-2 text-lg font-semibold text-blue-800 dark:text-blue-300">
        Enable Many Custom Checklists
      </h3>
      <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
        {isAlreadyInterested
          ? "We've noted your interest — you'll get early access!"
          : 'Want to browse, rate, and share checklists with the community? Express interest to help shape this feature and get early access.'}
      </p>

      {isAlreadyInterested ? (
        <div className="w-full rounded-md bg-green-500 px-4 py-2 text-center text-white">
          ✓ Interest Noted
        </div>
      ) : hasSubmitted ? (
        <div className="w-full rounded-md bg-green-500 px-4 py-2 text-center text-white">
          ✓ Thanks for your interest!
        </div>
      ) : (
        <button
          onClick={handleExpressInterest}
          disabled={isSubmitting}
          className="w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          {isSubmitting ? 'Processing...' : "I'm Interested"}
        </button>
      )}
    </div>
  )
}

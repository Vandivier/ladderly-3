'use client'

import React, { useState } from 'react'
import { api } from '~/trpc/react'

export function DeepJournalingWaitlist() {
  const [isJoining, setIsJoining] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)

  // Get current user profile to check if already interested
  const userProfileQuery = api.user.getUserProfile.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
  })
  const isAlreadyInterested = userProfileQuery.data?.hasDeepJournalingInterest

  // Mutation to update user profile
  const updateUserMutation = api.user.updateUserProfile.useMutation({
    onSuccess: () => {
      setHasJoined(true)
      userProfileQuery.refetch()
      setIsJoining(false)
    },
    onError: (error) => {
      console.error('Error updating profile:', error)
      setIsJoining(false)
    },
  })

  const handleJoinWaitlist = async () => {
    if (isJoining || isAlreadyInterested) return

    setIsJoining(true)

    updateUserMutation.mutate({
      hasDeepJournalingInterest: true,
    })
  }

  // Display different content based on whether user has joined the waitlist
  return (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 shadow-sm">
      <h3 className="mb-2 text-lg font-semibold text-yellow-800">
        Deep Journaling
      </h3>
      <p className="mb-4 text-sm text-gray-700">
        Want to journal more than 21 entries per week?{' '}
        {isAlreadyInterested
          ? "You're on the waitlist!"
          : 'Sign up for the Deep Journaling waitlist!'}
      </p>

      {isAlreadyInterested ? (
        <div className="w-full rounded-md bg-green-500 px-4 py-2 text-center text-white">
          ✓ On Waitlist
        </div>
      ) : hasJoined ? (
        <div className="w-full rounded-md bg-green-500 px-4 py-2 text-center text-white">
          ✓ Joined Waitlist!
        </div>
      ) : (
        <button
          onClick={handleJoinWaitlist}
          disabled={isJoining}
          className="w-full rounded-md bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600 disabled:bg-yellow-300"
        >
          {isJoining ? 'Processing...' : 'Join Waitlist'}
        </button>
      )}
    </div>
  )
}

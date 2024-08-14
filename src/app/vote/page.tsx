'use client'

import React, { Suspense } from 'react'
import { useQuery, useMutation } from '@blitzjs/rpc'
import { LadderlyPageWrapper } from 'src/core/components/page-wrapper/LadderlyPageWrapper'
import getRandomVotablePair from './queries/getRandomVotablePair'
import createVote from './mutations/createVote'

const VotePageContent = () => {
  const [votablePair, { refetch }] = useQuery(getRandomVotablePair, null)

  const [castVote] = useMutation(createVote)

  const votableA = votablePair?.[0]
  const votableB = votablePair?.[1]

  const handleVote = async (winnerId: number) => {
    if (votableA && votableB) {
      try {
        await castVote({
          winnerId,
          votableAId: votableA.id,
          votableBId: votableB.id,
        })
        await refetch()
      } catch (error) {
        console.error('Error casting vote:', error)
      }
    } else {
      console.error('Invalid votable pair.')
    }
  }

  if (!votableA || !votableB) {
    return <p>Loading votable items...</p>
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="mb-4 text-2xl font-bold">
        Vote for the more prestigious!
      </h1>
      <div className="flex space-x-4">
        <button
          onClick={() => handleVote(votableA.id)}
          className="rounded border bg-blue-500 p-4 text-white"
        >
          {votableA.name}
        </button>
        <button
          onClick={() => handleVote(votableB.id)}
          className="rounded border bg-blue-500 p-4 text-white"
        >
          {votableB.name}
        </button>
      </div>
    </div>
  )
}

export default function VotePage() {
  return (
    <LadderlyPageWrapper title="Vote">
      <Suspense fallback={<div>Loading...</div>}>
        <VotePageContent />
      </Suspense>
    </LadderlyPageWrapper>
  )
}
